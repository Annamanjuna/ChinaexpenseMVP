import { DEFAULT_SETTINGS, PEOPLE, SHARED_PAYER } from "@/lib/constants";
import type {
  AppData,
  Expense,
  ExpensePayer,
  PersonName,
  TripSettings,
} from "@/types";

function normalizePerson(person: string): PersonName | null {
  if (person === "Husband") return "Kostya";
  return PEOPLE.includes(person as PersonName) ? (person as PersonName) : null;
}

function normalizePayer(raw: string): ExpensePayer | null {
  const p = raw.trim();
  if (
    p === SHARED_PAYER ||
    p === "Общее" ||
    p === "общее" ||
    p === "Shared" ||
    p === "shared"
  ) {
    return SHARED_PAYER;
  }
  return normalizePerson(p);
}

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
  const person = normalizePayer(String(x.person));
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
