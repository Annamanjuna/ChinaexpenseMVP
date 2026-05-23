"use client";

import { FormEvent, useEffect, useState } from "react";
import type { TripSettings } from "@/types";

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
        label="Ngày bắt đầu chuyến đi"
        type="date"
        value={form.tripStart}
        onChange={(v) => setForm({ ...form, tripStart: v })}
      />
      <Field
        label="Ngày kết thúc chuyến đi"
        type="date"
        value={form.tripEnd}
        onChange={(v) => setForm({ ...form, tripEnd: v })}
      />
      <Field
        label="Ngân sách mỗi ngày (CNY — cả 3 người)"
        type="number"
        min="0"
        step="1"
        value={String(form.dailyBudgetCny)}
        onChange={(v) =>
          setForm({ ...form, dailyBudgetCny: parseFloat(v) || 0 })
        }
      />
      <Field
        label="Tỷ giá: 1 CNY = ? VND"
        type="number"
        min="1"
        step="1"
        value={String(form.cnyToVndRate)}
        onChange={(v) =>
          setForm({ ...form, cnyToVndRate: parseFloat(v) || 4000 })
        }
      />

      <p className="text-xs text-slate-500">
        Mỗi ngày mới, ngân sách hàng ngày tự đặt lại. Chi tiêu được gom theo
        ngày trên thiết bị của bạn.
      </p>

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-600 py-4 text-lg font-semibold text-white shadow-md active:bg-brand-700"
      >
        Lưu cài đặt
      </button>

      {saved && (
        <p className="text-center text-sm font-medium text-green-600">
          Đã lưu ✓
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
