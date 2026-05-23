import { NextRequest, NextResponse } from "next/server";
import { validateOpenAIKeyFormat } from "@/lib/openai-http";
import { parseZaloImagesWithVision } from "@/lib/zalo-parse-vision";
import type { ZaloParseResponse } from "@/types/zalo";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_FILES = 5;

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function resolveMime(file: File): { mime: string } | { error: string } {
  const allowed = new Set(Object.values(MIME_BY_EXT));
  if (file.type && allowed.has(file.type)) {
    return { mime: file.type };
  }
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".heic") || lower.endsWith(".heif")) {
    return {
      error:
        "HEIC с iPhone не поддерживается. Сделайте скриншот (PNG) или: Настройки → Камера → Форматы → Наиболее совместимые.",
    };
  }
  for (const [ext, mime] of Object.entries(MIME_BY_EXT)) {
    if (lower.endsWith(ext)) return { mime };
  }
  if (!file.type || file.type === "application/octet-stream") {
    return { mime: "image/jpeg" };
  }
  return {
    error: `Формат не поддерживается (${file.name}). Используйте JPG или PNG.`,
  };
}

export async function POST(request: NextRequest) {
  const keyError = validateOpenAIKeyFormat(process.env.OPENAI_API_KEY);
  if (keyError) {
    return NextResponse.json({ error: keyError }, { status: 503 });
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
    const resolved = resolveMime(file);
    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
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
      mimeType: resolved.mime,
    });
  }

  const { expenses, warning, error } = await parseZaloImagesWithVision(images);

  const response: ZaloParseResponse & { error?: string } = {
    expenses,
    method: "vision",
    warning,
    error,
  };

  if (error && expenses.length === 0) {
    return NextResponse.json(response, { status: 422 });
  }

  return NextResponse.json(response);
}
