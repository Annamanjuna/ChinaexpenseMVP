import { PEOPLE, SHARED_PAYER } from "@/lib/constants";
import type { ExpensePayer, PersonName } from "@/types";
import type { ParsedZaloExpense } from "@/types/zalo";
import { isValidParsedList } from "@/lib/zalo-parse-regex";

export const ZALO_AI_SYSTEM = `You extract travel expenses for a China trip from:
- Zalo chat messages
- Photos of receipts (Chinese 收据/发票/小票), payment screenshots, QR pay confirmations

People: ${PEOPLE.join(", ")}. Use "Shared" (or Общее) when the expense is split between all ${PEOPLE.length} people.
Default currency: CNY (Chinese Yuan) for everything in China.

IMPORTANT — receipts:
- Totals often have NO ¥, yuan, or 元 symbol — only numbers.
- Look for 合计, 总计, 实付, 应付, 金额, 小计, or the final/largest payment amount.
- One receipt photo = usually ONE expense; note = shop/merchant name (or "Чек").
- Map "Husband", "Костя" to Kostya.

Do NOT use amounts clearly in VND (đ, VND, ₫, донг) or USD ($) unless converted to CNY.

Return JSON only:
{ "expenses": [ { "person": "Anna"|"Kostya"|"Taya"|"Shared", "amountCny": number, "note": "optional" } ] }`;

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
  amountCny?: number | string;
  note?: string;
}): ParsedZaloExpense | null {
  let person = e.person;
  if (person === "Husband") person = "Kostya";
  if (
    person === "Shared" ||
    person === "Общее" ||
    person === "общее"
  ) {
    person = SHARED_PAYER;
  }
  if (!person || (!PEOPLE.includes(person as PersonName) && person !== SHARED_PAYER)) {
    person = "Anna";
  }
  const amountCny =
    typeof e.amountCny === "string"
      ? parseFloat(e.amountCny.replace(",", "."))
      : Number(e.amountCny);
  if (!amountCny || amountCny <= 0 || Number.isNaN(amountCny)) return null;
  return {
    person: person as ExpensePayer,
    amountCny: Math.round(amountCny * 100) / 100,
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
