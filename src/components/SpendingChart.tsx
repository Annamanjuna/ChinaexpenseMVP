"use client";

import type { Expense } from "@/types";
import { formatCny, getTodayDateString } from "@/lib/format";
import { computeSplitSummary } from "@/lib/person-stats";
import { t } from "@/lib/strings";

interface SpendingChartProps {
  expenses: Expense[];
  rate: number;
}

export function SpendingChart({ expenses, rate }: SpendingChartProps) {
  const today = getTodayDateString();
  const todayExpenses = (expenses ?? []).filter((e) => e.date === today);
  const split = computeSplitSummary(todayExpenses, rate);

  const max = Math.max(...split.perPerson.map((p) => p.cny), 1);
  const hasAny = split.perPerson.some((p) => p.cny > 0);

  if (!hasAny) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">
        {t.spendingByPerson}
      </h2>
      <ul className="space-y-3">
        {split.perPerson.map(({ person, cny }) => (
          <li key={person}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-slate-700">{person}</span>
              <span className="tabular-nums text-slate-600">
                {formatCny(cny)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${(cny / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
