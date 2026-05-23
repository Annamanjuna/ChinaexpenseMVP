import { PEOPLE } from "@/lib/constants";
import type { PersonName } from "@/types";
import type { ParsedZaloExpense } from "@/types/zalo";
import { isValidParsedList } from "@/lib/zalo-parse-regex";

export const ZALO_AI_SYSTEM = `You extract travel expenses for a China trip from:
- Zalo chat messages
- Photos of receipts (Chinese 收据/发票/小票), payment screenshots, QR pay confirmations

People (exact names only): ${PEOPLE.join(", ")}.
Default currency: CNY (Chinese Yuan) for everything in China.

IMPORTANT — receipts:
- Totals often have NO ¥, yuan, or 元 symbol — only numbers.
- Look for 合计, 总计, 实付, 应付, 金额, 小计, or the final/largest payment amount.
- One receipt photo = usually ONE expense; note = shop/merchant name (or "Чек").
- Map "Husband", "Костя" to Kostya.

Do NOT use amounts clearly in VND (đ, VND, ₫, донг) or USD ($) unless converted to CNY.

Return JSON only:
{ "expenses": [ { "person": "Anna"|"Kostya"|"Taya", "amountCny": number, "note": "optional" } ] }`;

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
