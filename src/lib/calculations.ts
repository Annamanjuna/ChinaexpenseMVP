import type { BudgetSummary, Expense, TripSettings } from "@/types";
import { computeSplitSummary } from "@/lib/person-stats";
import { getTodayDateString } from "@/lib/format";

export function cnyToVnd(cny: number, rate: number): number {
  return cny * rate;
}

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

export function isDateInTrip(date: string, settings: TripSettings): boolean {
  return date >= settings.tripStart && date <= settings.tripEnd;
}

export function computeBudgetSummary(
  expenses: Expense[],
  settings: TripSettings,
  today: string = getTodayDateString()
): BudgetSummary {
  const rate = settings.cnyToVndRate;
  const todayExpenses = expenses.filter((e) => e.date === today);
  const tripExpenses = expenses.filter(
    (e) => e.date >= settings.tripStart && e.date <= settings.tripEnd
  );

  const todayTotals = sumExpensesForDate(expenses, today);
  const tripTotals = sumTripExpenses(expenses, settings);
  const todaySplit = computeSplitSummary(todayExpenses, rate);
  const tripSplit = computeSplitSummary(tripExpenses, rate);

  const dailyBudgetCny = settings.dailyBudgetCny;
  const dailyRemainingCny = dailyBudgetCny - todayTotals.cny;
  const dailyRemainingVnd = cnyToVnd(dailyRemainingCny, rate);
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
    dailyProgressPercent: isOverBudget ? 100 : dailyProgressPercent,
    todayDate: today,
    isTripDay: isDateInTrip(today, settings),
    todaySplit,
    tripSplit,
  };
}
