/** Format CNY with 2 decimal places */
export function formatCny(amount: number): string {
  return `¥${amount.toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Format VND (no decimals) */
export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString("vi-VN")} ₫`;
}

/** Short time for expense list, e.g. "14:32" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Friendly date label for list headers */
export function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const today = getTodayDateString();
  if (dateStr === today) return "Сегодня";
  return d.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Today's date as YYYY-MM-DD in local timezone */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
