import { NextRequest, NextResponse } from "next/server";
import { parseZaloTextWithAI } from "@/lib/zalo-parse-ai";
import { parseZaloTextRegex } from "@/lib/zalo-parse-regex";
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
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text || text.length < 3) {
    return NextResponse.json(
      { error: "Вставьте текст из чата Zalo" },
      { status: 400 }
    );
  }

  if (text.length > 20000) {
    return NextResponse.json(
      { error: "Слишком длинный текст (макс. 20000 символов)" },
      { status: 400 }
    );
  }

  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  if (hasOpenAI) {
    const { expenses, warning } = await parseZaloTextWithAI(text);
    const response: ZaloParseResponse = {
      expenses,
      method: "ai",
      warning,
    };
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
