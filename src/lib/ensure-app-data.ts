import { parseAppData } from "@/lib/validate-app-data";
import type { AppData } from "@/types";

/** Всегда возвращает валидный объект с expenses: [] */
export function ensureAppData(raw: unknown): AppData {
  return parseAppData(raw);
}
