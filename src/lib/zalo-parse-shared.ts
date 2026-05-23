import { PEOPLE } from "@/lib/constants";
import type { PersonName } from "@/types";
import type { ParsedZaloExpense } from "@/types/zalo";
import { isValidParsedList } from "@/lib/zalo-parse-regex";

export const ZALO_AI_SYSTEM = `You extract travel expenses from Zalo chat (text or screenshots) for a China trip.
People (exact names only): ${PEOPLE.join(", ")}.
Amounts must be in CNY (Chinese Yuan). Convert 元/￥/yuan/RMB to a CNY number.
Map "Husband", "Костя", "Костя" to Kostya.
Return JSON only: { "expenses": [ { "person": "Anna"|"Kostya"|"Taya", "amountCny": number, "note": "optional short description" } ] }
Include every message that clearly mentions a CNY amount. Skip stickers and messages without amounts.`;

export function parseExpensesFromAiJson(
  content: string
): ParsedZaloExpense[] {
  const parsed = JSON.parse(content) as {
    expenses?: { person?: string; amountCny?: number; note?: string }[];
  };
  return (parsed.expenses ?? [])
    .map((e) => normalizeAiItem(e))
    .filter((e): e is ParsedZaloExpense => e !== null);
}

export function normalizeAiItem(e: {
  person?: string;
  amountCny?: number;
  note?: string;
}): ParsedZaloExpense | null {
  let person = e.person;
  if (person === "Husband") person = "Kostya";
  if (!person || !PEOPLE.includes(person as PersonName)) return null;
  const amountCny = Number(e.amountCny);
  if (!amountCny || amountCny <= 0) return null;
  return {
    person: person as PersonName,
    amountCny,
    note: e.note?.trim() || undefined,
  };
}

export function dedupeExpenses(items: ParsedZaloExpense[]): ParsedZaloExpense[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.person}-${item.amountCny}-${item.note ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function validateExpenses(items: ParsedZaloExpense[]): boolean {
  return isValidParsedList(items);
}
