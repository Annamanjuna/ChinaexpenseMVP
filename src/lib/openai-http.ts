/** Вызов OpenAI Chat Completions с понятной ошибкой */

export type OpenAIResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

/** Читает и очищает ключ из process.env */
export function getOpenAIKey(): string | undefined {
  const raw = process.env.OPENAI_API_KEY;
  if (!raw) return undefined;
  let k = raw.trim();
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1).trim();
  }
  if (k.toLowerCase().startsWith("bearer ")) {
    k = k.slice(7).trim();
  }
  return k || undefined;
}

/** Первые символы для подсказки (без раскрытия секрета) */
export function openAIKeyHint(key: string | undefined): string {
  if (!key?.trim()) return "— (пусто)";
  const k = key.trim();
  if (k.length <= 8) return `${k.slice(0, 3)}…`;
  return `${k.slice(0, 7)}…`;
}

export function validateOpenAIKeyFormat(key: string | undefined): string | null {
  if (!key?.trim()) {
    return (
      "OPENAI_API_KEY не задан в Vercel → Settings → Environment Variables. " +
      "После добавления нажмите Redeploy."
    );
  }
  const k = key.trim();

  if (k.startsWith("key_")) {
    return (
      "В Vercel вставлен ID ключа (key_…), а не секрет. " +
      "На platform.openai.com → API keys → Create → скопируйте Secret key (sk-…). " +
      "Секрет показывают только один раз при создании — при потере создайте новый ключ."
    );
  }

  if (k.startsWith("sb_") || k.startsWith("eyJ")) {
    return (
      "Похоже, в OPENAI_API_KEY вставлен ключ Supabase (sb_… или eyJ…), а не OpenAI. " +
      "Нужен отдельный ключ с platform.openai.com → API keys."
    );
  }

  if (!k.startsWith("sk-")) {
    return (
      `Ключ в Vercel начинается с «${openAIKeyHint(k)}», а нужен секрет sk-… ` +
      "(platform.openai.com → API keys → Secret key)."
    );
  }

  if (k.length < 20) {
    return "Ключ слишком короткий — скопируйте полный секрет sk-… целиком.";
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
  const k = getOpenAIKey() ?? apiKey.trim();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${k}`,
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
        "OpenAI отклонил ключ (401). Создайте новый Secret key на platform.openai.com и обновите Vercel → Redeploy.";
    }
    if (res.status === 429) {
      message =
        "Лимит OpenAI (429). Попробуйте позже или добавьте оплату: platform.openai.com → Billing.";
    }
    if (
      res.status === 403 &&
      /billing|quota|credit/i.test(message)
    ) {
      message =
        "Нужна оплата OpenAI: platform.openai.com → Settings → Billing → добавьте карту или кредиты.";
    }

    return { ok: false, status: res.status, message };
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return { ok: true, data };
}
