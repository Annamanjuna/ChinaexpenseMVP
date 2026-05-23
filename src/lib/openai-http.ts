/** Вызов OpenAI Chat Completions с понятной ошибкой */

export type OpenAIResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export function validateOpenAIKeyFormat(key: string | undefined): string | null {
  if (!key?.trim()) {
    return "OPENAI_API_KEY не задан в Vercel (Settings → Environment Variables).";
  }
  const k = key.trim();
  if (k.startsWith("sb_") || k.startsWith("eyJ")) {
    return (
      "Похоже, в OPENAI_API_KEY вставлен ключ Supabase, а не OpenAI. " +
      "Нужен ключ с platform.openai.com — он начинается с sk-..."
    );
  }
  if (!k.startsWith("sk-")) {
    return "Ключ OpenAI должен начинаться с sk- (создайте на platform.openai.com → API keys).";
  }
  return null;
}

export async function openaiChatCompletions(
  apiKey: string,
  body: Record<string, unknown>
): Promise<
  OpenAIResult<{
    choices?: { message?: { content?: string } }[];
  }>
> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = `OpenAI ответил ${res.status}`;
    try {
      const j = JSON.parse(raw) as { error?: { message?: string } };
      if (j.error?.message) message = j.error.message;
    } catch {
      if (raw.length < 200) message = raw || message;
    }

    if (res.status === 401) {
      message =
        "Неверный OPENAI_API_KEY (401). Создайте новый ключ на platform.openai.com (начинается с sk-).";
    }
    if (res.status === 429) {
      message = "Лимит OpenAI (429). Попробуйте позже или пополните баланс.";
    }

    return { ok: false, status: res.status, message };
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return { ok: true, data };
}
