"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/strings";

/** Проверка OPENAI_API_KEY на сервере (при открытии страницы Zalo) */
export function OpenAIHealthCheck() {
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/zalo/health");
        const data = (await res.json()) as {
          ok?: boolean;
          message?: string;
          hint?: string;
        };
        if (cancelled) return;
        setStatus(data?.ok ? "ok" : "fail");
        const parts = [data?.message, data?.hint].filter(Boolean);
        setMessage(parts.join(" ") || t.zaloHealthNetworkError);
      } catch {
        if (!cancelled) {
          setStatus("fail");
          setMessage(t.zaloHealthNetworkError);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        {t.zaloHealthChecking}
      </p>
    );
  }

  return (
    <div
      className={`rounded-xl border px-3 py-2 text-xs ${
        status === "ok"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-amber-300 bg-amber-50 text-amber-900"
      }`}
    >
      <p className="font-semibold">
        {status === "ok" ? t.zaloHealthOkTitle : t.zaloHealthFailTitle}
      </p>
      <p className="mt-1">{message}</p>
      {status === "fail" && (
        <p className="mt-2 text-[11px] opacity-90">{t.zaloHealthHint}</p>
      )}
    </div>
  );
}
