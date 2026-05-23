"use client";

import { LoadingScreen } from "@/components/LoadingScreen";
import { NavBar } from "@/components/NavBar";
import { SettingsForm } from "@/components/SettingsForm";
import { useTravelStore } from "@/hooks/useTravelStore";

/** Settings: daily budget, exchange rate, trip dates */
export default function SettingsPage() {
  const { hydrated, settings, updateSettings, clearExpenses } =
    useTravelStore();

  if (!hydrated || !settings) {
    return (
      <>
        <NavBar title="Cài đặt" backHref="/" />
        <LoadingScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar title="Cài đặt" backHref="/" />
      <main className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <SettingsForm settings={settings} onSave={updateSettings} />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Dữ liệu cục bộ
          </h2>
          <p className="mb-3 text-xs text-slate-500">
            Chi tiêu được lưu trên cloud (Supabase). Anna, Husband và Taya dùng
            cùng một link sẽ thấy cùng dữ liệu.
          </p>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Xóa tất cả chi tiêu? Không thể hoàn tác."
                )
              ) {
                clearExpenses();
              }
            }}
            className="w-full rounded-xl border border-danger-500/50 py-3 text-sm font-medium text-danger-600"
          >
            Xóa tất cả chi tiêu
          </button>
        </section>

        <p className="text-center text-xs text-slate-400">
          Bước 2: nhập từ Zalo + AI (sắp có)
        </p>
      </main>
    </div>
  );
}
