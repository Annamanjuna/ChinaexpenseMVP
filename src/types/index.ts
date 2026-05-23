/** Person who paid for an expense */
export type PersonName = "Anna" | "Husband" | "Taya";

/** A single expense entry */
export interface Expense {
  id: string;
  person: PersonName;
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
  tripStart: string; // YYYY-MM-DD
  tripEnd: string;
  dailyBudgetCny: number;
  cnyToVndRate: number;
}

/** Everything persisted in localStorage */
export interface AppData {
  expenses: Expense[];
  settings: TripSettings;
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
  /** 0–100, can exceed 100 when over budget */
  dailyProgressPercent: number;
  todayDate: string;
  isTripDay: boolean;
}
