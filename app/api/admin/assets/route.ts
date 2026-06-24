import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ASSET_BUCKET = "portfolio-assets";
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp"
]);

type AssetRecord = {
  id: string;
  name: string;
  path: string;
  publicUrl: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string | null;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await assertAdmin();
    const supabase = createSupabaseAdminClient();
    await ensureAssetBucket();

    const { data, error } = await supabase.storage
      .from(ASSET_BUCKET)
      .list("", {
        limit: 200,
        offset: 0,
        sortBy: {
          column: "created_at",
          order: "desc"
        }
      });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message
        },
        { status: 500 }
      );
    }

    const assets: AssetRecord[] = (data ?? [])
      .filter((item) => item.name && !item.name.endsWith("/"))
      .map((item) => {
        const { data: publicData } = supabase.storage
          .from(ASSET_BUCKET)
          .getPublicUrl(item.name);

        return {
          id: item.id ?? item.name,
          name: item.name,
          path: item.name,
          publicUrl: publicData.publicUrl,
          mimeType: getStorageMimeType(item.metadata),
          size: getStorageSize(item.metadata),
          createdAt: item.created_at ?? null
        };
      });

    return NextResponse.json({ ok: true, assets });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await assertAdmin();
    const supabase = createSupabaseAdminClient();
    await ensureAssetBucket();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Upload an image file."
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Only PNG, JPG, WebP, GIF, and SVG images are allowed."
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          ok: false,
          error: "Image must be 8 MB or smaller."
        },
        { status: 400 }
      );
    }

    const objectPath = makeObjectPath(file.name);
    const upload = await supabase.storage
      .from(ASSET_BUCKET)
      .upload(objectPath, Buffer.from(await file.arrayBuffer()), {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false
      });

    if (upload.error) {
      return NextResponse.json(
        {
          ok: false,
          error: upload.error.message
        },
        { status: 500 }
      );
    }

    const { data: publicData } = supabase.storage
      .from(ASSET_BUCKET)
      .getPublicUrl(objectPath);

    const asset: AssetRecord = {
      id: objectPath,
      name: file.name,
      path: objectPath,
      publicUrl: publicData.publicUrl,
      mimeType: file.type,
      size: file.size,
      createdAt: new Date().toISOString()
    };

    await supabase.from("portfolio_assets").insert({
      bucket_id: ASSET_BUCKET,
      object_path: objectPath,
      public_url: publicData.publicUrl,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size
    });

    return NextResponse.json({ ok: true, asset });
  } catch (error) {
    return jsonError(error);
  }
}

async function ensureAssetBucket() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.getBucket(ASSET_BUCKET);

  if (!error && data) {
    if (!data.public) {
      await supabase.storage.updateBucket(ASSET_BUCKET, {
        public: true,
        allowedMimeTypes: [...ALLOWED_MIME_TYPES],
        fileSizeLimit: MAX_FILE_SIZE
      });
    }
    return;
  }

  await supabase.storage.createBucket(ASSET_BUCKET, {
    public: true,
    allowedMimeTypes: [...ALLOWED_MIME_TYPES],
    fileSizeLimit: MAX_FILE_SIZE
  });
}

function makeObjectPath(fileName: string) {
  const safeName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Date.now().toString(36);

  return `${Date.now()}-${suffix}-${safeName || "image"}`;
}

function getStorageMimeType(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const value = (metadata as Record<string, unknown>).mimetype;
  return typeof value === "string" ? value : null;
}

function getStorageSize(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const value = (metadata as Record<string, unknown>).size;
  return typeof value === "number" ? value : null;
}

function jsonError(error: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to manage assets."
    },
    { status: getErrorStatus(error) }
  );
}

function getErrorStatus(error: unknown) {
  if (!(error instanceof Error)) {
    return 500;
  }

  if (error.message.includes("sign in")) {
    return 401;
  }

  if (error.message.includes("not listed")) {
    return 403;
  }

  return 500;
}
