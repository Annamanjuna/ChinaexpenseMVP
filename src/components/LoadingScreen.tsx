/** Shown while hydrating localStorage on the client */
export function LoadingScreen() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-slate-500">Đang tải...</p>
    </div>
  );
}
