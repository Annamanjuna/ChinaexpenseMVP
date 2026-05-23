import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { AppData, Expense, PersonName, TripSettings } from "@/types";

const PEOPLE: PersonName[] = ["Anna", "Husband", "Taya"];

/** Normalize and validate data from the database or API body */
export function parseAppData(raw: unknown): AppData {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Partial<AppData>;

  const expenses = Array.isArray(obj.expenses)
    ? obj.expenses.filter(isValidExpense)
    : [];

  const settings: TripSettings = {
    ...DEFAULT_SETTINGS,
    ...(obj.settings && typeof obj.settings === "object"
      ? (obj.settings as Partial<TripSettings>)
      : {}),
  };

  return { expenses, settings };
}

function isValidExpense(e: unknown): e is Expense {
  if (!e || typeof e !== "object") return false;
  const x = e as Expense;
  return (
    typeof x.id === "string" &&
    PEOPLE.includes(x.person) &&
    typeof x.amountCny === "number" &&
    typeof x.amountVnd === "number" &&
    typeof x.date === "string" &&
    typeof x.createdAt === "string"
  );
}
