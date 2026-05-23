import { NextRequest, NextResponse } from "next/server";
import { getOpenAIKey, validateOpenAIKeyFormat } from "@/lib/openai-http";
import { parseZaloImagesWithVision } from "@/lib/zalo-parse-vision";
import { zaloErrorResponse } from "@/lib/zalo-api-response";
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
  const keyError = validateOpenAIKeyFormat(getOpenAIKey());
  if (keyError) {
    return zaloErrorResponse(keyError, 503, "vision");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return zaloErrorResponse("Неверный запрос", 400, "vision");
  }

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return zaloErrorResponse(
      "Выберите хотя бы один скриншот (JPG или PNG).",
      400,
      "vision"
    );
  }

  if (files.length > MAX_FILES) {
    return zaloErrorResponse(
      `Максимум ${MAX_FILES} скриншотов за раз.`,
      400,
      "vision"
    );
  }

  const images: { base64: string; mimeType: string }[] = [];

  for (const file of files) {
    const resolved = resolveMime(file);
    if ("error" in resolved) {
      return zaloErrorResponse(resolved.error, 400, "vision");
    }
    if (file.size > MAX_FILE_BYTES) {
      return zaloErrorResponse(
        `Файл слишком большой: ${file.name} (макс. 4 МБ).`,
        400,
        "vision"
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
    expenses: expenses ?? [],
    method: "vision",
    warning,
    error,
  };

  if (error && (expenses?.length ?? 0) === 0) {
    return NextResponse.json(response, { status: 422 });
  }

  return NextResponse.json(response);
}
