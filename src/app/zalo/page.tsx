"use client";

import { LoadingScreen } from "@/components/LoadingScreen";
import { NavBar } from "@/components/NavBar";
import { ZaloImportForm } from "@/components/ZaloImportForm";
import { useTravelStore } from "@/hooks/useTravelStore";
import { t } from "@/lib/strings";

export default function ZaloPage() {
  const { hydrated, addExpenses } = useTravelStore();

  if (!hydrated) {
    return (
      <>
        <NavBar title={t.zaloTitle} backHref="/" />
        <LoadingScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar title={t.zaloTitle} backHref="/" />
      <main className="mx-auto max-w-lg px-4 py-6">
        <ZaloImportForm onAddBatch={addExpenses} />
      </main>
    </div>
  );
}
