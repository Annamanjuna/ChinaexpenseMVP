"use client";

import type { Expense } from "@/types";
import { PEOPLE_COUNT } from "@/lib/constants";
import { formatCny, formatDateLabel, formatTime, formatVnd } from "@/lib/format";
import { isSharedPayer, payerLabel, sharedPerPerson } from "@/lib/person-stats";
import { t } from "@/lib/strings";

interface ExpenseListProps {
  expenses: Expense[];
  onRemove?: (id: string) => void;
  title?: string;
}

export function ExpenseList({ expenses, onRemove, title }: ExpenseListProps) {
  const list = expenses ?? [];
  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        {t.noExpenses}
      </div>
    );
  }

  const grouped = groupByDate(list);

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      )}
      {grouped.map(({ date, items, dayTotalCny }) => (
        <div key={date}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {formatDateLabel(date)}
            </span>
            <span className="text-xs font-medium text-slate-600 tabular-nums">
              {formatCny(dayTotalCny)}
            </span>
          </div>
          <ul className="space-y-2">
            {items.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                onRemove={onRemove}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ExpenseRow({
  expense,
  onRemove,
}: {
  expense: Expense;
  onRemove?: (id: string) => void;
}) {
  const shared = isSharedPayer(expense.person);
  const label = payerLabel(expense.person);
  const perOne = shared ? sharedPerPerson(expense.amountCny) : null;

  return (
    <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          shared
            ? "bg-violet-100 text-violet-700"
            : "bg-brand-100 text-brand-700"
        }`}
        aria-hidden
      >
        {shared ? "3" : label.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-slate-900">{label}</p>
            <p className="text-lg font-bold tabular-nums text-slate-900">
              {formatCny(expense.amountCny)}
            </p>
            {shared && perOne !== null && (
              <p className="text-sm text-violet-600 tabular-nums">
                ÷{PEOPLE_COUNT} = {formatCny(perOne)} {t.perPersonEach}
              </p>
            )}
            <p className="text-sm text-slate-500 tabular-nums">
              {formatVnd(expense.amountVnd)}
            </p>
          </div>
          <time
            className="shrink-0 text-xs text-slate-400"
            dateTime={expense.createdAt}
          >
            {formatTime(expense.createdAt)}
          </time>
        </div>
        {expense.note && (
          <p className="mt-1 text-sm text-slate-600">{expense.note}</p>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(expense.id)}
          className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-danger-600"
          aria-label={t.delete}
        >
          ✕
        </button>
      )}
    </li>
  );
}

function groupByDate(expenses: Expense[]) {
  const map = new Map<string, Expense[]>();
  for (const e of expenses) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      items,
      dayTotalCny: items.reduce((s, i) => s + i.amountCny, 0),
    }));
}
