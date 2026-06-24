import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/auth";
import {
  portfolioContentSchema,
  portfolioThemeSettingsSchema
} from "@/lib/portfolio/schema";
import {
  getPortfolioContent,
  getPortfolioThemeSettings,
  savePortfolioContent
} from "@/lib/portfolio/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await assertAdmin();

    return NextResponse.json({
      ok: true,
      content: await getPortfolioContent(),
      themeSettings: await getPortfolioThemeSettings()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to load content."
      },
      { status: getErrorStatus(error) }
    );
  }
}

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
    const body = isRecord(json) && "content" in json ? json : null;
    const content = portfolioContentSchema.parse(body ? body.content : json);
    const themeSettings =
      body && "themes" in body && "activeThemeId" in body
        ? portfolioThemeSettingsSchema.parse({
            themes: body.themes,
            activeThemeId: body.activeThemeId
          })
        : undefined;
    const { error } = await savePortfolioContent(content, themeSettings);

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
