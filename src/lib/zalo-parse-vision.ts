import type { ParsedZaloExpense } from "@/types/zalo";
import {
  dedupeExpenses,
  parseExpensesFromAiJson,
  validateExpenses,
  ZALO_AI_SYSTEM,
} from "@/lib/zalo-parse-shared";

const VISION_MODEL = "gpt-4o-mini";
const MAX_IMAGES = 5;

export type ImageInput = {
  base64: string;
  mimeType: string;
};

/**
 * Разбор скриншотов Zalo через OpenAI Vision (нужен OPENAI_API_KEY).
 */
export async function parseZaloImagesWithVision(
  images: ImageInput[]
): Promise<{ expenses: ParsedZaloExpense[]; warning?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      expenses: [],
      warning: "Для скриншотов нужен OPENAI_API_KEY в Vercel.",
    };
  }

  if (images.length === 0) {
    return { expenses: [], warning: "Нет изображений." };
  }

  const slice = images.slice(0, MAX_IMAGES);
  const all: ParsedZaloExpense[] = [];
  let lastWarning: string | undefined;

  for (let i = 0; i < slice.length; i++) {
    const img = slice[i];
    const dataUrl = `data:${img.mimeType};base64,${img.base64}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: ZALO_AI_SYSTEM },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Screenshot ${i + 1} of ${slice.length}. May be: Zalo chat, Chinese receipt (收据), Alipay/WeChat payment screen, or invoice.
Trip is in China — amounts are CNY unless clearly VND or USD.
Receipts often have NO ¥ symbol: use 合计/总计/实付/金额 or the final total number.
One receipt = one expense. Chat = one expense per message with an amount.`,
              },
              {
                type: "image_url",
                image_url: { url: dataUrl, detail: "high" },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("OpenAI vision error:", await res.text());
      lastWarning = `Ошибка разбора скриншота ${i + 1}.`;
      continue;
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) continue;

    try {
      const expenses = parseExpensesFromAiJson(content);
      if (validateExpenses(expenses)) {
        all.push(...expenses);
      }
    } catch {
      lastWarning = `Не удалось разобрать скриншот ${i + 1}.`;
    }
  }

  const deduped = dedupeExpenses(all);
  if (deduped.length === 0) {
    return {
      expenses: [],
      warning:
        lastWarning ??
        "Не удалось найти сумму. Сфотографируйте чётко строку с итогом (合计 / 总计 / 实付) или весь чек.",
    };
  }

  return { expenses: deduped, warning: lastWarning };
}
