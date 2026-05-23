import type { BudgetSummary, Expense, TripSettings } from "@/types";
import { getTodayDateString } from "@/lib/format";

/** Convert CNY to VND using the configured rate */
export function cnyToVnd(cny: number, rate: number): number {
  return cny * rate;
}

/** Sum expenses for a specific calendar day */
export function sumExpensesForDate(
  expenses: Expense[],
  date: string
): { cny: number; vnd: number } {
  const filtered = expenses.filter((e) => e.date === date);
  return {
    cny: filtered.reduce((s, e) => s + e.amountCny, 0),
    vnd: filtered.reduce((s, e) => s + e.amountVnd, 0),
  };
}

/** Sum all expenses within trip date range (inclusive) */
export function sumTripExpenses(
  expenses: Expense[],
  settings: TripSettings
): { cny: number; vnd: number } {
  const filtered = expenses.filter(
    (e) => e.date >= settings.tripStart && e.date <= settings.tripEnd
  );
  return {
    cny: filtered.reduce((s, e) => s + e.amountCny, 0),
    vnd: filtered.reduce((s, e) => s + e.amountVnd, 0),
  };
}

/** Check if a date falls within the trip window */
export function isDateInTrip(date: string, settings: TripSettings): boolean {
  return date >= settings.tripStart && date <= settings.tripEnd;
}

/**
 * Build the sticky summary card numbers.
 * Daily budget resets automatically each calendar day (we filter by today's date).
 */
export function computeBudgetSummary(
  expenses: Expense[],
  settings: TripSettings,
  today: string = getTodayDateString()
): BudgetSummary {
  const todayTotals = sumExpensesForDate(expenses, today);
  const tripTotals = sumTripExpenses(expenses, settings);
  const dailyBudgetCny = settings.dailyBudgetCny;
  const dailyRemainingCny = dailyBudgetCny - todayTotals.cny;
  const dailyRemainingVnd = cnyToVnd(dailyRemainingCny, settings.cnyToVndRate);
  const isOverBudget = dailyRemainingCny < 0;
  const dailyProgressPercent =
    dailyBudgetCny > 0
      ? Math.min(100, (todayTotals.cny / dailyBudgetCny) * 100)
      : 0;

  return {
    todaySpentCny: todayTotals.cny,
    todaySpentVnd: todayTotals.vnd,
    tripSpentCny: tripTotals.cny,
    tripSpentVnd: tripTotals.vnd,
    dailyBudgetCny,
    dailyRemainingCny,
    dailyRemainingVnd,
    isOverBudget,
    dailyProgressPercent: isOverBudget
      ? 100
      : dailyProgressPercent,
    todayDate: today,
    isTripDay: isDateInTrip(today, settings),
  };
}
