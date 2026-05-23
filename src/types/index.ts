/** Участники поездки */
export type PersonName = "Anna" | "Kostya" | "Taya";

/** Кто указан в расходе: человек или общий (делится на 3) */
export type ExpensePayer = PersonName | "Shared";

/** A single expense entry */
export interface Expense {
  id: string;
  person: ExpensePayer;
  amountCny: number;
  amountVnd: number;
  note?: string;
  /** ISO date string (YYYY-MM-DD) for grouping by day */
  date: string;
  /** Full ISO timestamp for display */
  createdAt: string;
}

/** Trip and budget settings (editable in Settings) */
export interface TripSettings {
  tripStart: string;
  tripEnd: string;
  dailyBudgetCny: number;
  cnyToVndRate: number;
}

/** Everything persisted in localStorage / Supabase */
export interface AppData {
  expenses: Expense[];
  settings: TripSettings;
}

/** Сумма на одного человека (с учётом доли от «Общее») */
export interface PersonAmount {
  person: PersonName;
  cny: number;
  vnd: number;
}

/** Разбивка: общая сумма + доля каждого */
export interface SplitSummary {
  grossCny: number;
  grossVnd: number;
  sharedCny: number;
  sharedVnd: number;
  perPerson: PersonAmount[];
}

/** Одна строка в истории по дням */
export interface DayHistoryRow {
  date: string;
  grossCny: number;
  grossVnd: number;
  perPerson: PersonAmount[];
}

/** Computed summary numbers shown on the main page */
export interface BudgetSummary {
  todaySpentCny: number;
  todaySpentVnd: number;
  tripSpentCny: number;
  tripSpentVnd: number;
  dailyBudgetCny: number;
  dailyRemainingCny: number;
  dailyRemainingVnd: number;
  isOverBudget: boolean;
  dailyProgressPercent: number;
  todayDate: string;
  isTripDay: boolean;
  todaySplit: SplitSummary;
  tripSplit: SplitSummary;
}
