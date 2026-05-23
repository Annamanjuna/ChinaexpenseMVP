import type { BudgetSummary } from "@/types";
import { formatCny } from "@/lib/format";

interface DailyProgressBarProps {
  summary: BudgetSummary;
}

/**
 * Visual daily budget usage.
 * Turns red when spending exceeds the daily limit.
 */
export function DailyProgressBar({ summary }: DailyProgressBarProps) {
  const spent = summary.todaySpentCny;
  const budget = summary.dailyBudgetCny;
  const percent =
    budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const overPercent = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-xs text-slate-600">
        <span>Ngân sách hôm nay</span>
        <span>
          {formatCny(spent)} / {formatCny(budget)}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            summary.isOverBudget ? "bg-danger-500" : "bg-brand-500"
          }`}
          style={{
            width: `${summary.isOverBudget ? 100 : percent}%`,
          }}
        />
      </div>
      {summary.isOverBudget && (
        <p className="mt-1 text-xs font-medium text-danger-600">
          Vượt ngân sách {formatCny(Math.abs(summary.dailyRemainingCny))}
          {overPercent > 100 && ` (${Math.round(overPercent)}%)`}
        </p>
      )}
    </div>
  );
}
