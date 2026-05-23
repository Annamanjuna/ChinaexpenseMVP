"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { computeBudgetSummary, cnyToVnd } from "@/lib/calculations";
import { SYNC_POLL_MS } from "@/lib/constants";
import { getTodayDateString } from "@/lib/format";
import {
  getDefaultAppData,
  getMockExpenses,
  loadAppData,
  saveAppData,
} from "@/lib/storage";
import { t } from "@/lib/strings";
import { fetchTripFromCloud, saveTripToCloud } from "@/lib/trip-api";
import type {
  AppData,
  BudgetSummary,
  Expense,
  PersonName,
  TripSettings,
} from "@/types";

export type SyncStatus = "loading" | "synced" | "saving" | "error" | "offline";

/**
 * Shared state for the whole group.
 * - Primary: Supabase via /api/trip (same data on every phone)
 * - Fallback: localStorage if cloud is not configured (local dev only)
 */
export function useTravelStore() {
  const [data, setData] = useState<AppData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [useLocalFallback, setUseLocalFallback] = useState(false);

  const updatedAtRef = useRef<string | undefined>(undefined);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSaveRef = useRef(false);

  const applyRemoteData = useCallback((appData: AppData) => {
    skipNextSaveRef.current = true;
    setData(appData);
    setSyncStatus("synced");
    setSyncError(null);
  }, []);

  const refreshFromCloud = useCallback(async () => {
    try {
      const res = await fetch("/api/trip", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      updatedAtRef.current =
        res.headers.get("x-trip-updated-at") ?? undefined;
      const appData = (await res.json()) as AppData;
      applyRemoteData(appData);
      return true;
    } catch {
      return false;
    }
  }, [applyRemoteData]);

  // Initial load: cloud first, then localStorage fallback
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { data: remote, updatedAt } = await fetchTripFromCloud();
        if (cancelled) return;
        updatedAtRef.current = updatedAt;
        applyRemoteData(remote);

        const local = loadAppData();
        if (local.expenses.length > 0 && remote.expenses.length === 0) {
          setData(local);
          setSyncStatus("saving");
        }
      } catch {
        const local = loadAppData();
        if (!cancelled) {
          setData(local);
          setUseLocalFallback(true);
          setSyncStatus("offline");
          setSyncError(t.cloudNotConfigured);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [applyRemoteData]);

  // Auto-save to cloud (debounced) when data changes
  useEffect(() => {
    if (!hydrated || !data || useLocalFallback) {
      if (useLocalFallback && data) saveAppData(data);
      return;
    }

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      setSyncStatus("saving");
      try {
        const result = await saveTripToCloud(data, updatedAtRef.current);
        updatedAtRef.current = result.updatedAt;
        setSyncStatus("synced");
        setSyncError(null);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : t.cloudSaveFailed;
        setSyncStatus("error");
        setSyncError(message);
        if (
          message.includes("409") ||
          message.includes("обновил") ||
          message.includes("updated")
        ) {
          await refreshFromCloud();
        }
      }
    }, 400);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, hydrated, useLocalFallback, refreshFromCloud]);

  // Poll + refresh when tab becomes visible (so all 3 see each other's entries)
  useEffect(() => {
    if (!hydrated || useLocalFallback) return;

    const poll = () => {
      void refreshFromCloud();
    };

    const interval = setInterval(poll, SYNC_POLL_MS);
    const onFocus = () => poll();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") poll();
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [hydrated, useLocalFallback, refreshFromCloud]);

  const updateSettings = useCallback((settings: TripSettings) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, settings };
    });
  }, []);

  const buildExpense = useCallback(
    (person: PersonName, amountCny: number, note?: string): Expense | null => {
      if (!data || amountCny <= 0) return null;
      const rate = data.settings.cnyToVndRate;
      const today = getTodayDateString();
      return {
        id: crypto.randomUUID(),
        person,
        amountCny,
        amountVnd: cnyToVnd(amountCny, rate),
        note: note?.trim() || undefined,
        date: today,
        createdAt: new Date().toISOString(),
      };
    },
    [data]
  );

  const addExpense = useCallback(
    (person: PersonName, amountCny: number, note?: string) => {
      const expense = buildExpense(person, amountCny, note);
      if (!expense) return false;
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, expenses: [expense, ...prev.expenses] };
      });
      return true;
    },
    [buildExpense]
  );

  /** Импорт нескольких расходов из Zalo */
  const addExpenses = useCallback(
    (items: { person: PersonName; amountCny: number; note?: string }[]) => {
      const newOnes: Expense[] = [];
      for (const item of items) {
        const e = buildExpense(item.person, item.amountCny, item.note);
        if (e) newOnes.push(e);
      }
      if (newOnes.length === 0) return 0;
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, expenses: [...newOnes, ...prev.expenses] };
      });
      return newOnes.length;
    },
    [buildExpense]
  );

  const removeExpense = useCallback((id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== id),
      };
    });
  }, []);

  const loadMockData = useCallback(() => {
    setData((prev) => {
      const base = prev ?? getDefaultAppData();
      const rate = base.settings.cnyToVndRate;
      return {
        ...base,
        expenses: [...getMockExpenses(rate), ...base.expenses],
      };
    });
  }, []);

  const clearExpenses = useCallback(() => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, expenses: [] };
    });
  }, []);

  const summary: BudgetSummary | null =
    data && hydrated
      ? computeBudgetSummary(data.expenses, data.settings)
      : null;

  const expensesSorted = data
    ? [...data.expenses].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  return {
    hydrated,
    settings: data?.settings ?? null,
    expenses: expensesSorted,
    summary,
    syncStatus,
    syncError,
    useLocalFallback,
    addExpense,
    addExpenses,
    removeExpense,
    updateSettings,
    loadMockData,
    clearExpenses,
    refreshFromCloud,
  };
}
