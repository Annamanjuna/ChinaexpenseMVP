import { NextResponse } from "next/server";
import {
  getOpenAIKey,
  openaiChatCompletions,
  openAIKeyHint,
  validateOpenAIKeyFormat,
} from "@/lib/openai-http";

/** GET — проверка OPENAI_API_KEY на сервере Vercel */
export async function GET() {
  const key = getOpenAIKey();
  const formatError = validateOpenAIKeyFormat(key);

  if (formatError) {
    return NextResponse.json({
      ok: false,
      message: formatError,
      hint: key ? `Сейчас в переменной: ${openAIKeyHint(key)}` : undefined,
    });
  }

  const test = await openaiChatCompletions(key!, {
    model: "gpt-4o-mini",
    max_tokens: 16,
    messages: [{ role: "user", content: "Reply with OK" }],
  });

  if (!test.ok) {
    return NextResponse.json({
      ok: false,
      message: test.message,
      hint: `Ключ загружен (${openAIKeyHint(key)}), но запрос к OpenAI не прошёл.`,
    });
  }

  return NextResponse.json({
    ok: true,
    message: "OpenAI подключён. Скриншоты и умный разбор работают.",
  });
}
