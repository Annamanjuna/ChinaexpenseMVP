import type { BudgetSummary } from "@/types";
import { formatCny, formatVnd } from "@/lib/format";
import { t } from "@/lib/strings";
import { DailyProgressBar } from "@/components/DailyProgressBar";

interface SummaryCardProps {
  summary: BudgetSummary;
}

/**
 * Sticky summary at the top of the main page:
 * daily remaining, today spent, trip total.
 */
export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <section
      className={`sticky top-[88px] z-30 border-b px-4 py-4 shadow-sm ${
        summary.isOverBudget
          ? "border-danger-500/30 bg-danger-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mx-auto max-w-lg">
        {!summary.isTripDay && (
          <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {t.notTripDay}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatBlock
            label={t.remainingToday}
            value={formatCny(summary.dailyRemainingCny)}
            sub={formatVnd(summary.dailyRemainingVnd)}
            highlight={summary.isOverBudget}
          />
          <StatBlock
            label={t.spentToday}
            value={formatCny(summary.todaySpentCny)}
            sub={formatVnd(summary.todaySpentVnd)}
          />
          <StatBlock
            label={t.tripTotal}
            value={formatCny(summary.tripSpentCny)}
            sub={formatVnd(summary.tripSpentVnd)}
          />
        </div>

        <DailyProgressBar summary={summary} />
      </div>
    </section>
  );
}

function StatBlock({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 ${
        highlight ? "bg-white/80 ring-1 ring-danger-500/40" : "bg-slate-50"
      }`}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p
        className={`mt-0.5 text-xl font-bold tabular-nums ${
          highlight ? "text-danger-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500 tabular-nums">{sub}</p>
    </div>
  );
}
