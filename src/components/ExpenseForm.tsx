"use client";

import { FormEvent, useState } from "react";
import { EXPENSE_PAYERS } from "@/lib/constants";
import { t } from "@/lib/strings";
import type { ExpensePayer } from "@/types";

interface ExpenseFormProps {
  onAdd: (payer: ExpensePayer, amountCny: number, note?: string) => boolean;
}

export function ExpenseForm({ onAdd }: ExpenseFormProps) {
  const [person, setPerson] = useState<ExpensePayer>("Anna");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = parseFloat(amount.replace(",", "."));
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError(t.invalidAmount);
      return;
    }

    const ok = onAdd(person, parsed, note);
    if (ok) {
      setAmount("");
      setNote("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-3 text-sm font-semibold text-slate-700">
        {t.addExpense}
      </h2>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">
            {t.whoPaid}
          </span>
          <select
            value={person}
            onChange={(e) => setPerson(e.target.value as ExpensePayer)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-900"
          >
            {EXPENSE_PAYERS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {person === "Shared" && (
            <p className="mt-1 text-xs text-slate-500">{t.sharedFormHint}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">
            {t.amountCny}
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder={t.amountPlaceholder}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold tabular-nums"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">
            {t.noteOptional}
          </span>
          <input
            type="text"
            placeholder={t.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>

        {error && (
          <p className="text-sm text-danger-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-brand-600 py-4 text-lg font-semibold text-white shadow-md active:bg-brand-700"
        >
          {t.addExpenseButton}
        </button>
      </div>
    </form>
  );
}
