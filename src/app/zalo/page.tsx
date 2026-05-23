"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingScreen } from "@/components/LoadingScreen";
import { NavBar } from "@/components/NavBar";
import { OpenAIHealthCheck } from "@/components/OpenAIHealthCheck";
import { ZaloImportForm } from "@/components/ZaloImportForm";
import { useTravelStore } from "@/hooks/useTravelStore";
import { t } from "@/lib/strings";

export default function ZaloPage() {
  const { hydrated, settings, addExpenses } = useTravelStore();

  if (!hydrated || !settings) {
    return (
      <>
        <NavBar title={t.zaloTitle} backHref="/" />
        <LoadingScreen />
      </>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <NavBar title={t.zaloTitle} backHref="/" />
        <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
          <OpenAIHealthCheck />
          <ZaloImportForm onAddBatch={addExpenses} />
        </main>
      </div>
    </ErrorBoundary>
  );
}
