"use client";

import { FormEvent, useEffect, useState } from "react";
import type { TripSettings } from "@/types";
import { t } from "@/lib/strings";

interface SettingsFormProps {
  settings: TripSettings;
  onSave: (settings: TripSettings) => void;
}

/** Editable trip budget, exchange rate, and dates */
export function SettingsForm({ settings, onSave }: SettingsFormProps) {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      tripStart: form.tripStart,
      tripEnd: form.tripEnd,
      dailyBudgetCny: Number(form.dailyBudgetCny),
      cnyToVndRate: Number(form.cnyToVndRate),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label={t.settingsTripStart}
        type="date"
        value={form.tripStart}
        onChange={(v) => setForm({ ...form, tripStart: v })}
      />
      <Field
        label={t.settingsTripEnd}
        type="date"
        value={form.tripEnd}
        onChange={(v) => setForm({ ...form, tripEnd: v })}
      />
      <Field
        label={t.settingsDailyBudget}
        type="number"
        min="0"
        step="1"
        value={String(form.dailyBudgetCny)}
        onChange={(v) =>
          setForm({ ...form, dailyBudgetCny: parseFloat(v) || 0 })
        }
      />
      <Field
        label={t.settingsRate}
        type="number"
        min="1"
        step="1"
        value={String(form.cnyToVndRate)}
        onChange={(v) =>
          setForm({ ...form, cnyToVndRate: parseFloat(v) || 4000 })
        }
      />

      <p className="text-xs text-slate-500">
        {t.settingsHint}
      </p>

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-600 py-4 text-lg font-semibold text-white shadow-md active:bg-brand-700"
      >
        {t.saveSettings}
      </button>

      {saved && (
        <p className="text-center text-sm font-medium text-green-600">
          {t.saved}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  step?: string;
}) {
  return (
    <label className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </label>
  );
}
