import type { ParsedZaloExpense } from "@/types/zalo";
import { parseZaloTextRegex } from "@/lib/zalo-parse-regex";
import {
  parseExpensesFromAiJson,
  validateExpenses,
  ZALO_AI_SYSTEM,
} from "@/lib/zalo-parse-shared";

const MODEL = "gpt-4o-mini";

export async function parseZaloTextWithAI(
  text: string
): Promise<{ expenses: ParsedZaloExpense[]; warning?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      expenses: parseZaloTextRegex(text),
      warning: "OPENAI_API_KEY не задан — использован простой разбор.",
    };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ZALO_AI_SYSTEM },
        {
          role: "user",
          content: `Chat messages:\n\n${text.slice(0, 12000)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("OpenAI text error:", await res.text());
    return {
      expenses: parseZaloTextRegex(text),
      warning: "Ошибка ИИ — использован простой разбор.",
    };
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    return {
      expenses: parseZaloTextRegex(text),
      warning: "Пустой ответ ИИ — простой разбор.",
    };
  }

  try {
    const expenses = parseExpensesFromAiJson(content);
    if (expenses.length === 0) {
      return {
        expenses: parseZaloTextRegex(text),
        warning: "ИИ не нашёл расходов — простой разбор.",
      };
    }
    if (!validateExpenses(expenses)) {
      return {
        expenses: parseZaloTextRegex(text),
        warning: "Некорректный ответ ИИ.",
      };
    }
    return { expenses };
  } catch {
    return {
      expenses: parseZaloTextRegex(text),
      warning: "Не удалось прочитать JSON от ИИ.",
    };
  }
}
