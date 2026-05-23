"use client";

import type { Expense } from "@/types";
import { PEOPLE } from "@/lib/constants";
import { formatCny, getTodayDateString } from "@/lib/format";

interface SpendingChartProps {
  expenses: Expense[];
}

/**
 * Simple horizontal bar chart: today's spending per person.
 * Lightweight — pure CSS, no chart library.
 */
export function SpendingChart({ expenses }: SpendingChartProps) {
  const today = getTodayDateString();
  const todayExpenses = expenses.filter((e) => e.date === today);

  const totals = PEOPLE.map((person) => ({
    person,
    amount: todayExpenses
      .filter((e) => e.person === person)
      .reduce((s, e) => s + e.amountCny, 0),
  }));

  const max = Math.max(...totals.map((t) => t.amount), 1);
  const hasAny = totals.some((t) => t.amount > 0);

  if (!hasAny) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">
        Chi tiêu hôm nay theo người
      </h2>
      <ul className="space-y-3">
        {totals.map(({ person, amount }) => (
          <li key={person}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-slate-700">{person}</span>
              <span className="tabular-nums text-slate-600">
                {formatCny(amount)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${(amount / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
