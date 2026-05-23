import { NextResponse } from "next/server";
import { openaiChatCompletions, validateOpenAIKeyFormat } from "@/lib/openai-http";

/** GET — проверка, настроен ли ключ OpenAI (для диагностики на странице Zalo) */
export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  const formatError = validateOpenAIKeyFormat(key);

  if (formatError) {
    return NextResponse.json({
      ok: false,
      message: formatError,
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
    });
  }

  return NextResponse.json({
    ok: true,
    message: "OpenAI подключён. Скриншоты и умный разбор текста работают.",
  });
}
