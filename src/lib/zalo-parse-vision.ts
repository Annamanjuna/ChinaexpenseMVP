import type { ParsedZaloExpense } from "@/types/zalo";
import {
  getOpenAIKey,
  openaiChatCompletions,
  validateOpenAIKeyFormat,
} from "@/lib/openai-http";
import {
  dedupeExpenses,
  parseExpensesFromAiJson,
  ZALO_AI_SYSTEM,
} from "@/lib/zalo-parse-shared";

const VISION_MODEL = "gpt-4o-mini";
const MAX_IMAGES = 5;

export type ImageInput = {
  base64: string;
  mimeType: string;
};

export type VisionParseResult = {
  expenses: ParsedZaloExpense[];
  warning?: string;
  error?: string;
};

export async function parseZaloImagesWithVision(
  images: ImageInput[]
): Promise<VisionParseResult> {
  const apiKey = getOpenAIKey();
  const keyError = validateOpenAIKeyFormat(apiKey);
  if (keyError) {
    return { expenses: [], error: keyError };
  }

  if (images.length === 0) {
    return { expenses: [], error: "Нет изображений." };
  }

  const slice = images.slice(0, MAX_IMAGES);
  const all: ParsedZaloExpense[] = [];
  let firstApiError: string | undefined;

  for (let i = 0; i < slice.length; i++) {
    const img = slice[i];
    const dataUrl = `data:${img.mimeType};base64,${img.base64}`;

    const result = await openaiChatCompletions(apiKey!, {
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
              text: `Screenshot ${i + 1} of ${slice.length}. Zalo chat, Chinese receipt, or payment app.
China trip — amounts in CNY. Receipts often have no ¥: use 合计/总计/实付 or total. person: Anna/Kostya/Taya if known, else Anna.`,
            },
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
          ],
        },
      ],
    });

    if (!result.ok) {
      firstApiError ??= result.message;
      continue;
    }

    const content = result.data.choices?.[0]?.message?.content;
    if (!content) {
      firstApiError ??= `Пустой ответ ИИ для скриншота ${i + 1}.`;
      continue;
    }

    try {
      const expenses = parseExpensesFromAiJson(content);
      if (expenses.length > 0) {
        all.push(...expenses);
      }
    } catch {
      firstApiError ??= `Не удалось прочитать ответ ИИ (скриншот ${i + 1}).`;
    }
  }

  const deduped = dedupeExpenses(all);
  if (deduped.length > 0) {
    return { expenses: deduped };
  }

  return {
    expenses: [],
    error:
      firstApiError ??
      "ИИ не нашёл сумму на фото. Попробуйте чётче снять строку 合计 / 总计 / 实付.",
  };
}
