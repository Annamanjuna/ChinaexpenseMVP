"use client";

import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { LoadingScreen } from "@/components/LoadingScreen";
import { NavBar } from "@/components/NavBar";
import { SpendingChart } from "@/components/SpendingChart";
import { SummaryCard } from "@/components/SummaryCard";
import { useTravelStore } from "@/hooks/useTravelStore";
import { t } from "@/lib/strings";

export default function HomePage() {
  const { hydrated, expenses, summary, addExpense, removeExpense, loadMockData } =
    useTravelStore();

  if (!hydrated || !summary) {
    return (
      <>
        <NavBar title={t.appTitle} showHomeActions />
        <LoadingScreen />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar title={t.appTitle} showHomeActions />
      <SummaryCard summary={summary} />

      <main className="mx-auto w-full max-w-lg flex-1 space-y-6 px-4 py-6">
        <ExpenseForm onAdd={addExpense} />
        <SpendingChart expenses={expenses} />
        <ExpenseList expenses={expenses} onRemove={removeExpense} />

        {(expenses ?? []).length === 0 && (
          <button
            type="button"
            onClick={loadMockData}
            className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm text-slate-500"
          >
            {t.loadMock}
          </button>
        )}
      </main>
    </div>
  );
}
