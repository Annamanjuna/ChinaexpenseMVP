"use client";

import { formatCny } from "@/lib/format";
import { t } from "@/lib/strings";
import type { ParsedZaloExpense } from "@/types/zalo";

interface ZaloExpensePreviewProps {
  parsed: ParsedZaloExpense[];
  selected: Set<number>;
  onToggle: (index: number) => void;
  onAdd: () => void;
}

export function ZaloExpensePreview({
  parsed,
  selected,
  onToggle,
  onAdd,
}: ZaloExpensePreviewProps) {
  if (parsed.length === 0) return null;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-800">{t.zaloPreview}</h3>
      <ul className="space-y-2">
        {parsed.map((item, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={selected.has(i)}
                onChange={() => onToggle(i)}
                className="mt-1 h-5 w-5"
              />
              <div>
                <p className="font-semibold text-slate-900">
                  {item.person} — {formatCny(item.amountCny)}
                </p>
                {item.note && (
                  <p className="text-sm text-slate-500">{item.note}</p>
                )}
              </div>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onAdd}
        disabled={selected.size === 0}
        className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-50"
      >
        {t.zaloAddSelected.replace("{n}", String(selected.size))}
      </button>
    </div>
  );
}
