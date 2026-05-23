import type { ParsedZaloExpense } from "@/types/zalo";
import {
  getOpenAIKey,
  openaiChatCompletions,
  validateOpenAIKeyFormat,
} from "@/lib/openai-http";
import { parseZaloTextRegex } from "@/lib/zalo-parse-regex";
import { parseExpensesFromAiJson, ZALO_AI_SYSTEM } from "@/lib/zalo-parse-shared";

const MODEL = "gpt-4o-mini";

export async function parseZaloTextWithAI(
  text: string
): Promise<{ expenses: ParsedZaloExpense[]; warning?: string; error?: string }> {
  const apiKey = getOpenAIKey();
  const keyError = validateOpenAIKeyFormat(apiKey);
  if (keyError) {
    return {
      expenses: parseZaloTextRegex(text),
      warning: keyError,
    };
  }

  const result = await openaiChatCompletions(apiKey!, {
    model: MODEL,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ZALO_AI_SYSTEM },
      { role: "user", content: `Chat or receipt text:\n\n${text.slice(0, 12000)}` },
    ],
  });

  if (!result.ok) {
    return {
      expenses: parseZaloTextRegex(text),
      error: result.message,
      warning: "Использован простой разбор из‑за ошибки OpenAI.",
    };
  }

  const content = result.data.choices?.[0]?.message?.content;
  if (!content) {
    return {
      expenses: parseZaloTextRegex(text),
      error: "Пустой ответ OpenAI.",
      warning: "Использован простой разбор.",
    };
  }

  try {
    const expenses = parseExpensesFromAiJson(content);
    if (expenses.length > 0) {
      return { expenses };
    }
    const fallback = parseZaloTextRegex(text);
    return {
      expenses: fallback,
      warning:
        fallback.length === 0
          ? "ИИ не нашёл сумм. Для чека вставьте текст с 合计/总计 или числом."
          : "ИИ не нашёл сумм — использован простой разбор.",
    };
  } catch {
    return {
      expenses: parseZaloTextRegex(text),
      error: "Не удалось прочитать JSON от OpenAI.",
      warning: "Использован простой разбор.",
    };
  }
}
