import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { AppData, Expense, PersonName, TripSettings } from "@/types";

const PEOPLE: PersonName[] = ["Anna", "Kostya", "Taya"];

/** Старое имя в базе — показываем как Kostya */
function normalizePerson(person: string): PersonName | null {
  if (person === "Husband") return "Kostya";
  return PEOPLE.includes(person as PersonName) ? (person as PersonName) : null;
}

/** Normalize and validate data from the database or API body */
export function parseAppData(raw: unknown): AppData {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Partial<AppData>;

  const expenses = Array.isArray(obj.expenses)
    ? obj.expenses.map(normalizeExpense).filter((e): e is Expense => e !== null)
    : [];

  const settings: TripSettings = {
    ...DEFAULT_SETTINGS,
    ...(obj.settings && typeof obj.settings === "object"
      ? (obj.settings as Partial<TripSettings>)
      : {}),
  };

  return { expenses, settings };
}

function normalizeExpense(e: unknown): Expense | null {
  if (!e || typeof e !== "object") return null;
  const x = e as Expense;
  const person = normalizePerson(String(x.person));
  if (
    !person ||
    typeof x.id !== "string" ||
    typeof x.amountCny !== "number" ||
    typeof x.amountVnd !== "number" ||
    typeof x.date !== "string" ||
    typeof x.createdAt !== "string"
  ) {
    return null;
  }
  return { ...x, person };
}
