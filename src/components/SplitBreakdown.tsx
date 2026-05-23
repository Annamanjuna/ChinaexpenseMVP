"use client";

import { useState } from "react";
import { formatCny, formatVnd } from "@/lib/format";
import { PEOPLE_COUNT } from "@/lib/constants";
import { t } from "@/lib/strings";
import type { SplitSummary } from "@/types";

interface SplitBreakdownProps {
  todaySplit: SplitSummary;
  tripSplit: SplitSummary;
}

/** Раскрывающийся блок: на каждого с учётом «Общее» ÷ 3 */
export function SplitBreakdown({ todaySplit, tripSplit }: SplitBreakdownProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"today" | "trip">("today");

  const split = tab === "today" ? todaySplit : tripSplit;
  const hasShared = split.sharedCny > 0;

  return (
    <div className="mt-3 border-t border-slate-200 pt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-700"
        aria-expanded={open}
      >
        <span>{t.perPersonBreakdown}</span>
        <span className="text-slate-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <Tab
              active={tab === "today"}
              onClick={() => setTab("today")}
              label={t.today}
            />
            <Tab
              active={tab === "trip"}
              onClick={() => setTab("trip")}
              label={t.tripShort}
            />
          </div>

          {hasShared && (
            <p className="text-xs text-slate-500">
              {t.sharedNote.replace("{n}", String(PEOPLE_COUNT))}:{" "}
              <span className="font-medium text-slate-700">
                {formatCny(split.sharedCny)}
              </span>
              {" → "}
              {formatCny(split.sharedCny / PEOPLE_COUNT)} {t.perPersonEach}
            </p>
          )}

          <ul className="space-y-2">
            {split.perPerson.map(({ person, cny, vnd }) => (
              <li
                key={person}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="font-medium text-slate-800">{person}</span>
                <div className="text-right">
                  <p className="font-semibold tabular-nums text-slate-900">
                    {formatCny(cny)}
                  </p>
                  <p className="text-xs tabular-nums text-slate-500">
                    {formatVnd(vnd)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
            <span>{t.grossTotal}</span>
            <span className="tabular-nums font-medium text-slate-700">
              {formatCny(split.grossCny)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md py-1.5 text-xs font-semibold ${
        active ? "bg-white text-brand-700 shadow-sm" : "text-slate-600"
      }`}
    >
      {label}
    </button>
  );
}
