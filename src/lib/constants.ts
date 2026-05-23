import type { ExpensePayer, PersonName, TripSettings } from "@/types";

export const PEOPLE: PersonName[] = ["Anna", "Kostya", "Taya"];

export const PEOPLE_COUNT = 3;

/** Значение в базе для общих расходов */
export const SHARED_PAYER: ExpensePayer = "Shared";

/** Подпись в интерфейсе */
export const SHARED_LABEL = "Общее";

/** Варианты в форме добавления */
export const EXPENSE_PAYERS: { value: ExpensePayer; label: string }[] = [
  ...PEOPLE.map((p) => ({ value: p as ExpensePayer, label: p })),
  { value: SHARED_PAYER, label: SHARED_LABEL },
];

export const STORAGE_KEY = "travel-expense-china-2026";
export const TRIP_STATE_ID = "china-2026";
export const SYNC_POLL_MS = 8000;

export const DEFAULT_SETTINGS: TripSettings = {
  tripStart: "2026-05-25",
  tripEnd: "2026-05-31",
  dailyBudgetCny: 660,
  cnyToVndRate: 4000,
};
