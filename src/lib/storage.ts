import { DEFAULT_SETTINGS, STORAGE_KEY } from "@/lib/constants";
import type { AppData, Expense, TripSettings } from "@/types";

/** Empty state when nothing is saved yet */
export function getDefaultAppData(): AppData {
  return {
    expenses: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Read from localStorage (browser only) */
export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return getDefaultAppData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultAppData();

    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings ?? {}),
      },
    };
  } catch {
    return getDefaultAppData();
  }
}

/** Persist full app state */
export function saveAppData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Optional: seed demo expenses for first-time testing */
export function getMockExpenses(rate: number): Expense[] {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return [
    {
      id: "mock-1",
      person: "Anna",
      amountCny: 45,
      amountVnd: 45 * rate,
      note: "Bữa trưa",
      date,
      createdAt: new Date(now.getTime() - 3600000).toISOString(),
    },
    {
      id: "mock-2",
      person: "Husband",
      amountCny: 28,
      amountVnd: 28 * rate,
      note: "Nước uống",
      date,
      createdAt: new Date(now.getTime() - 7200000).toISOString(),
    },
  ];
}

export function mergeSettings(partial: Partial<TripSettings>): TripSettings {
  return { ...DEFAULT_SETTINGS, ...partial };
}
