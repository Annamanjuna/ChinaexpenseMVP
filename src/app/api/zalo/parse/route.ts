import { NextRequest, NextResponse } from "next/server";
import { parseZaloTextWithAI } from "@/lib/zalo-parse-ai";
import { parseZaloTextRegex } from "@/lib/zalo-parse-regex";
import { zaloErrorResponse } from "@/lib/zalo-api-response";
import type { ZaloParseResponse } from "@/types/zalo";

/**
 * POST { "text": "скопированный чат Zalo" }
 * → список расходов для предпросмотра
 */
export async function POST(request: NextRequest) {
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return zaloErrorResponse("Неверный JSON", 400, "regex");
  }

  const text = body.text?.trim();
  if (!text || text.length < 3) {
    return zaloErrorResponse("Вставьте текст из чата Zalo", 400, "regex");
  }

  if (text.length > 20000) {
    return zaloErrorResponse(
      "Слишком длинный текст (макс. 20000 символов)",
      400,
      "regex"
    );
  }

  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  if (hasOpenAI) {
    const { expenses, warning, error } = await parseZaloTextWithAI(text);
    const response: ZaloParseResponse = {
      expenses: expenses ?? [],
      method: "ai",
      warning,
      error,
    };
    if (error && expenses.length === 0) {
      return NextResponse.json(response, { status: 422 });
    }
    return NextResponse.json(response);
  }

  const expenses = parseZaloTextRegex(text);
  const response: ZaloParseResponse = {
    expenses,
    method: "regex",
    warning:
      expenses.length === 0
        ? "Добавьте OPENAI_API_KEY в Vercel для умного разбора."
        : "Добавьте OPENAI_API_KEY в Vercel для более точного разбора.",
  };
  return NextResponse.json(response);
}
