import { PEOPLE } from "@/lib/constants";
import type { PersonName } from "@/types";
import type { ParsedZaloExpense } from "@/types/zalo";

/**
 * Простой разбор без OpenAI — если в Vercel нет OPENAI_API_KEY.
 */
export function parseZaloTextRegex(text: string): ParsedZaloExpense[] {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const results: ParsedZaloExpense[] = [];

  for (const line of lines) {
    const amountCny = extractCnyAmount(line);
    if (amountCny === null) continue;

    const person = detectPerson(line) ?? "Anna";
    const note = cleanNote(line, amountCny);

    results.push({ person, amountCny, note: note || undefined });
  }

  return dedupeParsed(results);
}

function extractCnyAmount(line: string): number | null {
  const patterns = [
    /[¥￥]\s*(\d+(?:[.,]\d+)?)/,
    /(\d+(?:[.,]\d+)?)\s*(?:yuan|cny|rmb|юан|юаней|元)\b/i,
    /(\d+(?:[.,]\d+)?)\s*[¥￥]/,
  ];

  for (const re of patterns) {
    const m = line.match(re);
    if (m) {
      const n = parseFloat(m[1].replace(",", "."));
      if (!Number.isNaN(n) && n > 0 && n < 1_000_000) return n;
    }
  }
  return null;
}

function detectPerson(line: string): PersonName | null {
  const lower = line.toLowerCase();
  if (/\bhusband\b|костя|kostya/i.test(line)) return "Kostya";
  if (/\banna\b|анна/i.test(lower)) return "Anna";
  if (/\btaya\b|тая/i.test(lower)) return "Taya";
  return null;
}

function cleanNote(line: string, amount: number): string {
  return line
    .replace(String(amount), "")
    .replace(/[¥￥]/g, "")
    .replace(/\b(yuan|cny|rmb|юан|юаней|元)\b/gi, "")
    .replace(/\b(Anna|Kostya|Taya|Husband|Анна|Костя|Тая)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function dedupeParsed(items: ParsedZaloExpense[]): ParsedZaloExpense[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.person}-${item.amountCny}-${item.note ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function isValidParsedList(items: ParsedZaloExpense[]): boolean {
  return items.every(
    (e) =>
      PEOPLE.includes(e.person) &&
      typeof e.amountCny === "number" &&
      e.amountCny > 0
  );
}
