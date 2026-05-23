import type { ExpensePayer } from "@/types";

/** Одна строка, которую ИИ или парсер извлёк из чата Zalo */
export interface ParsedZaloExpense {
  person: ExpensePayer;
  amountCny: number;
  note?: string;
}

export interface ZaloParseResponse {
  expenses: ParsedZaloExpense[];
  /** ai = текст OpenAI, vision = скриншот, regex = простой разбор */
  method: "ai" | "regex" | "vision";
  warning?: string;
  /** Главная ошибка (показываем красным, не «сумма не найдена») */
  error?: string;
}
