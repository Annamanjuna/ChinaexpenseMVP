"use client";

import { useRef, useState, type ReactNode } from "react";
import { ZaloExpensePreview } from "@/components/ZaloExpensePreview";
import { t } from "@/lib/strings";
import type { PersonName } from "@/types";
import type { ParsedZaloExpense, ZaloParseResponse } from "@/types/zalo";

type Tab = "text" | "screenshot";

interface ZaloImportFormProps {
  onAddBatch: (
    items: { person: PersonName; amountCny: number; note?: string }[]
  ) => number;
}

export function ZaloImportForm({ onAddBatch }: ZaloImportFormProps) {
  const [tab, setTab] = useState<Tab>("screenshot");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [parsed, setParsed] = useState<ParsedZaloExpense[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function applyParseResult(data: ZaloParseResponse & { error?: string }) {
    setParsed(data.expenses);
    setSelected(new Set(data.expenses.map((_, i) => i)));
    const parts: string[] = [];
    if (data.method === "vision") parts.push(t.zaloParsedVision);
    else if (data.method === "ai") parts.push(t.zaloParsedAi);
    else parts.push(t.zaloParsedSimple);
    if (data.warning) parts.push(data.warning);
    if (data.expenses.length === 0) parts.push(t.zaloNothingFound);
    setInfo(parts.join(" "));
  }

  async function handleParseText() {
    setError(null);
    setInfo(null);
    setLoading(true);
    setParsed(null);
    try {
      const res = await fetch("/api/zalo/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as ZaloParseResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? t.zaloParseError);
      applyParseResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.zaloParseError);
    } finally {
      setLoading(false);
    }
  }

  async function handleParseImages() {
    setError(null);
    setInfo(null);
    setLoading(true);
    setParsed(null);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      const res = await fetch("/api/zalo/parse-image", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as ZaloParseResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? t.zaloParseError);
      applyParseResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.zaloParseError);
    } finally {
      setLoading(false);
    }
  }

  function handleFilesChange(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).slice(0, 5);
    setFiles(picked);
    setPreviews(picked.map((f) => URL.createObjectURL(f)));
    setParsed(null);
    setError(null);
    setInfo(null);
  }

  function toggleIndex(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleAddSelected() {
    if (!parsed) return;
    const items = parsed.filter((_, i) => selected.has(i));
    const count = onAddBatch(items);
    setInfo(t.zaloAddedCount.replace("{n}", String(count)));
    setParsed(null);
    setText("");
    setFiles([]);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews([]);
    setSelected(new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl bg-slate-100 p-1">
        <TabButton active={tab === "screenshot"} onClick={() => setTab("screenshot")}>
          {t.zaloTabScreenshot}
        </TabButton>
        <TabButton active={tab === "text"} onClick={() => setTab("text")}>
          {t.zaloTabText}
        </TabButton>
      </div>

      {tab === "screenshot" ? (
        <>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{t.zaloScreenshotHow}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>{t.zaloScreenshotStep1}</li>
              <li>{t.zaloScreenshotStep2}</li>
              <li>{t.zaloScreenshotStep3}</li>
            </ol>
            <p className="mt-3 text-xs text-slate-500">{t.zaloScreenshotHint}</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={(e) => handleFilesChange(e.target.files)}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 py-8 text-center font-medium text-brand-700"
          >
            {t.zaloPickImages}
            {files.length > 0 && (
              <span className="mt-1 block text-sm font-normal text-slate-600">
                {t.zaloFilesSelected.replace("{n}", String(files.length))}
              </span>
            )}
          </button>

          {previews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {previews.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`Скриншот ${i + 1}`}
                  className="h-32 w-auto shrink-0 rounded-lg border border-slate-200 object-cover"
                />
              ))}
            </div>
          )}

          <button
            type="button"
            disabled={loading || files.length === 0}
            onClick={handleParseImages}
            className="w-full rounded-xl bg-brand-600 py-4 text-lg font-semibold text-white disabled:opacity-50"
          >
            {loading ? t.zaloParsing : t.zaloParseScreenshot}
          </button>
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{t.zaloHowTitle}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>{t.zaloStep1}</li>
              <li>{t.zaloStep2}</li>
              <li>{t.zaloStep3}</li>
              <li>{t.zaloStep4}</li>
            </ol>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              {t.zaloPasteLabel}
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={t.zaloPastePlaceholder}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </label>

          <button
            type="button"
            disabled={loading || text.trim().length < 3}
            onClick={handleParseText}
            className="w-full rounded-xl bg-brand-600 py-4 text-lg font-semibold text-white disabled:opacity-50"
          >
            {loading ? t.zaloParsing : t.zaloParseButton}
          </button>
        </>
      )}

      {error && (
        <p className="text-sm text-danger-600" role="alert">
          {error}
        </p>
      )}
      {info && !error && <p className="text-sm text-slate-600">{info}</p>}

      {parsed && (
        <ZaloExpensePreview
          parsed={parsed}
          selected={selected}
          onToggle={toggleIndex}
          onAdd={handleAddSelected}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
        active ? "bg-white text-brand-700 shadow-sm" : "text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}
