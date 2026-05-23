import type { SyncStatus } from "@/hooks/useTravelStore";

interface SyncStatusBarProps {
  status: SyncStatus;
  error: string | null;
  isLocalFallback: boolean;
}

/** Small indicator: cloud sync state for the shared trip */
export function SyncStatusBar({
  status,
  error,
  isLocalFallback,
}: SyncStatusBarProps) {
  const label = getLabel(status, isLocalFallback);

  return (
    <div
      className={`border-b px-4 py-1.5 text-center text-xs ${
        status === "error"
          ? "border-danger-500/30 bg-danger-50 text-danger-700"
          : isLocalFallback
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            status === "synced"
              ? "bg-green-500"
              : status === "saving" || status === "loading"
                ? "bg-brand-500 animate-pulse"
                : status === "error"
                  ? "bg-danger-500"
                  : "bg-amber-500"
          }`}
          aria-hidden
        />
        {label}
      </span>
      {error && status === "error" && (
        <p className="mt-0.5 text-[10px]">{error}</p>
      )}
    </div>
  );
}

function getLabel(status: SyncStatus, isLocalFallback: boolean): string {
  if (isLocalFallback) return "Chỉ lưu trên máy này — cần deploy + Supabase để chia sẻ";
  switch (status) {
    case "loading":
      return "Đang tải dữ liệu chung…";
    case "saving":
      return "Đang lưu…";
    case "synced":
      return "Đồng bộ cloud — mọi người thấy cùng dữ liệu";
    case "error":
      return "Lỗi đồng bộ";
    case "offline":
      return "Ngoại tuyến / chưa cấu hình cloud";
    default:
      return "";
  }
}
