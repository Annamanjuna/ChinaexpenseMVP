import type { PersonName, TripSettings } from "@/types";

/** The three travelers on this trip */
export const PEOPLE: PersonName[] = ["Anna", "Husband", "Taya"];

/** localStorage key — fallback when cloud is unavailable (dev/offline) */
export const STORAGE_KEY = "travel-expense-china-2026";

/** Supabase row id for this trip */
export const TRIP_STATE_ID = "china-2026";

/** How often to pull updates from the cloud (ms) */
export const SYNC_POLL_MS = 8000;

/**
 * Default trip settings for the China trip (May 25–31).
 * Users can change these on the Settings page.
 */
export const DEFAULT_SETTINGS: TripSettings = {
  tripStart: "2026-05-25",
  tripEnd: "2026-05-31",
  dailyBudgetCny: 660,
  cnyToVndRate: 4000,
};
