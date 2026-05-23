import { PEOPLE } from "@/lib/constants";
import type { PersonName } from "@/types";
import type { ParsedZaloExpense } from "@/types/zalo";

/** Подписи итога на китайских чеках (символ ¥ часто отсутствует) */
const RECEIPT_TOTAL_LABELS =
  /(?:合计|总计|总計|实付|實付|实付金额|应付|应付金额|金额|金額|小计|小計|收款|消费合计|total|amount\s*due|grand\s*total|итого|сумма)/i;

const EXPLICIT_CNY =
  /[¥￥]|yuan|cny|rmb|юан|юаней|元|人民币|人民幣/i;

const VND_MARKERS = /\b(vnd|đ|dong|₫|донг)\b|đ\s*$/i;

/**
 * Простой разбор без OpenAI.
 * Поддерживает чаты и чеки: суммы без символа юаня.
 */
export function parseZaloTextRegex(text: string): ParsedZaloExpense[] {
  const fromLines = parseLineByLine(text);
  if (fromLines.length > 0) return dedupeParsed(fromLines);

  const fromReceipt = parseAsReceipt(text);
  if (fromReceipt.length > 0) return fromReceipt;

  return [];
}

function parseLineByLine(text: string): ParsedZaloExpense[] {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const results: ParsedZaloExpense[] = [];

  for (const line of lines) {
    if (isLikelyVnd(line)) continue;

    const amountCny = extractAmountFromLine(line);
    if (amountCny === null) continue;

    const person = detectPerson(line) ?? detectPerson(text) ?? "Anna";
    const note = cleanNote(line, amountCny);

    results.push({ person, amountCny, note: note || undefined });
  }

  return results;
}

/** Один чек целиком — ищем строку «合计» / «总计» и т.п. */
function parseAsReceipt(text: string): ParsedZaloExpense[] {
  if (isLikelyVnd(text) && !EXPLICIT_CNY.test(text)) return [];

  const total = extractReceiptTotal(text);
  if (total === null) return [];

  const person = detectPerson(text) ?? "Anna";
  const note = extractMerchantNote(text) || "Чек";

  return [{ person, amountCny: total, note }];
}

function extractAmountFromLine(line: string): number | null {
  if (isLikelyVnd(line)) return null;

  const labeled = line.match(
    new RegExp(
      `(?:${RECEIPT_TOTAL_LABELS.source})[\\s:：]*[¥￥]?\\s*(\\d+(?:[.,]\\d{1,2})?)`,
      "i"
    )
  );
  if (labeled) return parseAmount(labeled[1]);

  if (EXPLICIT_CNY.test(line)) {
    const withSymbol = line.match(/[¥￥]\s*(\d+(?:[.,]\d{1,2})?)/);
    if (withSymbol) return parseAmount(withSymbol[1]);
    const afterNum = line.match(
      /(\d+(?:[.,]\d{1,2})?)\s*(?:yuan|cny|rmb|юан|юаней|元)/i
    );
    if (afterNum) return parseAmount(afterNum[1]);
  }

  if (RECEIPT_TOTAL_LABELS.test(line)) {
    const nums = findNumbersOnLine(line);
    const best = pickLikelyTotal(nums);
    if (best !== null) return best;
  }

  return null;
}

function extractReceiptTotal(text: string): number | null {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (isLikelyVnd(line) && !EXPLICIT_CNY.test(line)) continue;
    if (!RECEIPT_TOTAL_LABELS.test(line)) continue;
    const nums = findNumbersOnLine(line);
    const best = pickLikelyTotal(nums);
    if (best !== null) return best;
  }

  const blockMatch = text.match(
    new RegExp(
      `(?:${RECEIPT_TOTAL_LABELS.source})[\\s:：\\n]*[¥￥]?\\s*(\\d+(?:[.,]\\d{1,2})?)`,
      "i"
    )
  );
  if (blockMatch) return parseAmount(blockMatch[1]);

  if (looksLikeReceipt(text)) {
    const all = findNumbersOnLine(text.replace(/\n/g, " "));
    return pickLikelyTotal(all, true);
  }

  return null;
}

function looksLikeReceipt(text: string): boolean {
  return (
    RECEIPT_TOTAL_LABELS.test(text) ||
    /发票|收据|收银|商户|门店|支付宝|微信|alipay|wechat/i.test(text) ||
    (text.split(/\n/).length >= 3 && /\d+[.,]\d{2}/.test(text))
  );
}

function findNumbersOnLine(line: string): number[] {
  const matches = line.match(/\d+(?:[.,]\d{1,2})?/g) ?? [];
  return matches
    .map((m) => parseAmount(m))
    .filter((n): n is number => n !== null);
}

/** Итог на чеке — обычно самое большое разумное число в строке */
function pickLikelyTotal(nums: number[], receiptMode = false): number | null {
  const filtered = nums.filter((n) => n > 0 && n < 500_000);
  if (filtered.length === 0) return null;
  if (filtered.length === 1) return filtered[0];
  const max = Math.max(...filtered);
  if (receiptMode) return max;
  return max;
}

function parseAmount(raw: string): number | null {
  const n = parseFloat(raw.replace(",", "."));
  if (Number.isNaN(n) || n <= 0 || n >= 1_000_000) return null;
  return Math.round(n * 100) / 100;
}

function isLikelyVnd(line: string): boolean {
  if (VND_MARKERS.test(line)) return true;
  if (/\d{1,3}[.,]\d{3}/.test(line) && !EXPLICIT_CNY.test(line)) {
    const n = parseFloat((line.match(/\d+[.,]\d+/) ?? [""])[0].replace(",", ""));
    if (n > 5000 && !/[¥￥元]/.test(line)) return true;
  }
  return false;
}

function extractMerchantNote(text: string): string {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    if (line.length < 3 || line.length > 60) continue;
    if (/^\d+[.,]?\d*$/.test(line)) continue;
    if (RECEIPT_TOTAL_LABELS.test(line)) continue;
    if (/^20\d{2}[-/]/.test(line)) continue;
    return line.slice(0, 60);
  }
  return "";
}

function detectPerson(text: string): PersonName | null {
  const lower = text.toLowerCase();
  if (/\bhusband\b|костя|kostya/i.test(text)) return "Kostya";
  if (/\banna\b|анна/i.test(lower)) return "Anna";
  if (/\btaya\b|тая/i.test(lower)) return "Taya";
  return null;
}

function cleanNote(line: string, amount: number): string {
  return line
    .replace(String(amount), "")
    .replace(/[¥￥]/g, "")
    .replace(
      /\b(yuan|cny|rmb|юан|юаней|元|合计|总计|实付|金额)\b/gi,
      ""
    )
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
