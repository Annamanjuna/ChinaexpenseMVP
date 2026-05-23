"use client";

import { formatCny, formatDateLabel, formatVnd } from "@/lib/format";
import { computeHistoryByDay, computeSplitSummary } from "@/lib/person-stats";
import { t } from "@/lib/strings";
import type { Expense, TripSettings } from "@/types";

interface HistoryPageContentProps {
  expenses: Expense[];
  settings: TripSettings;
}

export function HistoryPageContent({
  expenses,
  settings,
}: HistoryPageContentProps) {
  const tripExpenses = expenses.filter(
    (e) => e.date >= settings.tripStart && e.date <= settings.tripEnd
  );
  const tripSplit = computeSplitSummary(tripExpenses, settings.cnyToVndRate);
  const byDay = computeHistoryByDay(expenses, settings);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">
          {t.historyTripTotal}
        </h2>
        <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
          {formatCny(tripSplit.grossCny)}
        </p>
        <p className="text-sm tabular-nums text-slate-500">
          {formatVnd(tripSplit.grossVnd)}
        </p>

        {tripSplit.sharedCny > 0 && (
          <p className="mt-2 text-xs text-violet-600">
            {t.sharedTotal}: {formatCny(tripSplit.sharedCny)} (÷3)
          </p>
        )}

        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {tripSplit.perPerson.map(({ person, cny, vnd }) => (
            <li
              key={person}
              className="flex justify-between text-sm"
            >
              <span className="font-medium text-slate-700">{person}</span>
              <span className="text-right tabular-nums">
                <span className="font-semibold text-slate-900">
                  {formatCny(cny)}
                </span>
                <span className="ml-2 text-slate-500">{formatVnd(vnd)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">
          {t.historyByDay}
        </h2>

        {byDay.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            {t.historyEmpty}
          </p>
        ) : (
          byDay.map((day) => (
            <div
              key={day.date}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-baseline justify-between">
                <span className="font-semibold text-slate-900">
                  {formatDateLabel(day.date)}
                </span>
                <span className="text-sm font-bold tabular-nums text-slate-800">
                  {formatCny(day.grossCny)}
                </span>
              </div>
              <ul className="space-y-1.5">
                {day.perPerson.map(({ person, cny }) => (
                  <li
                    key={person}
                    className="flex justify-between text-sm text-slate-600"
                  >
                    <span>{person}</span>
                    <span className="tabular-nums font-medium text-slate-800">
                      {formatCny(cny)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
