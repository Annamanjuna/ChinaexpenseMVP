"use client";

import Link from "next/link";
import { LoadingScreen } from "@/components/LoadingScreen";
import { NavBar } from "@/components/NavBar";
import { SettingsForm } from "@/components/SettingsForm";
import { useTravelStore } from "@/hooks/useTravelStore";
import { t } from "@/lib/strings";

/** Settings: daily budget, exchange rate, trip dates */
export default function SettingsPage() {
  const { hydrated, settings, updateSettings, clearExpenses } =
    useTravelStore();

  if (!hydrated || !settings) {
    return (
      <>
        <NavBar title={t.settings} backHref="/" />
        <LoadingScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar title={t.settings} backHref="/" />
      <main className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <SettingsForm settings={settings} onSave={updateSettings} />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            {t.dataSection}
          </h2>
          <p className="mb-3 text-xs text-slate-500">{t.dataHint}</p>
          <button
            type="button"
            onClick={() => {
              if (confirm(t.clearConfirm)) {
                clearExpenses();
              }
            }}
            className="w-full rounded-xl border border-danger-500/50 py-3 text-sm font-medium text-danger-600"
          >
            {t.clearAll}
          </button>
        </section>

        <Link
          href="/zalo"
          className="block text-center text-sm font-medium text-brand-600"
        >
          {t.zaloLink} →
        </Link>
      </main>
    </div>
  );
}
