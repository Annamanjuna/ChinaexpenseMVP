"use client";

import { HistoryPageContent } from "@/components/HistoryPageContent";
import { LoadingScreen } from "@/components/LoadingScreen";
import { NavBar } from "@/components/NavBar";
import { useTravelStore } from "@/hooks/useTravelStore";
import { t } from "@/lib/strings";

export default function HistoryPage() {
  const { hydrated, expenses, settings } = useTravelStore();

  if (!hydrated || !settings) {
    return (
      <>
        <NavBar title={t.historyPageTitle} backHref="/" />
        <LoadingScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar title={t.historyPageTitle} backHref="/" />
      <main className="mx-auto max-w-lg px-4 py-6">
        <HistoryPageContent expenses={expenses} settings={settings} />
      </main>
    </div>
  );
}
