import { NextRequest, NextResponse } from "next/server";
import { parseZaloImagesWithVision } from "@/lib/zalo-parse-vision";
import type { ZaloParseResponse } from "@/types/zalo";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 4 * 1024 * 1024; // лимит Vercel ~4.5 MB на запрос
const MAX_FILES = 5;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/**
 * POST multipart/form-data, поле "images" (один или несколько файлов)
 */
export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Для скриншотов добавьте OPENAI_API_KEY в Vercel → Settings → Environment Variables.",
      },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });
  }

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      { error: "Выберите хотя бы один скриншот (JPG или PNG)." },
      { status: 400 }
    );
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Максимум ${MAX_FILES} скриншотов за раз.` },
      { status: 400 }
    );
  }

  const images: { base64: string; mimeType: string }[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Формат не поддерживается: ${file.name}. Используйте JPG, PNG или WebP.`,
        },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `Файл слишком большой: ${file.name} (макс. 4 МБ).` },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    images.push({
      base64: buffer.toString("base64"),
      mimeType: file.type,
    });
  }

  const { expenses, warning } = await parseZaloImagesWithVision(images);

  const response: ZaloParseResponse = {
    expenses,
    method: "vision",
    warning,
  };

  return NextResponse.json(response);
}
