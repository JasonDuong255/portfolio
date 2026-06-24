import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/auth";
import { portfolioContentSchema } from "@/lib/portfolio/schema";
import { savePortfolioContent } from "@/lib/portfolio/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  return upsertContent(request);
}

export async function PUT(request: Request) {
  return upsertContent(request);
}

async function upsertContent(request: Request) {
  try {
    await assertAdmin();

    const json = (await request.json()) as unknown;
    const content = portfolioContentSchema.parse(json);
    const { error } = await savePortfolioContent(content);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message
        },
        { status: 500 }
      );
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to save content."
      },
      { status: getErrorStatus(error) }
    );
  }
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

  if (
    error.message.includes("not configured") ||
    error.message.includes("admin key")
  ) {
    return 500;
  }

  return 400;
}
