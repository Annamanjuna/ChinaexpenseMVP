import Link from "next/link";

interface NavBarProps {
  title: string;
  backHref?: string;
}

/** Simple top navigation with optional back link */
export function NavBar({ title, backHref }: NavBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {backHref ? (
            <Link
              href={backHref}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
              aria-label="Quay lại"
            >
              ←
            </Link>
          ) : (
            <span className="w-10" />
          )}
          <h1 className="truncate text-lg font-semibold text-slate-900">
            {title}
          </h1>
        </div>
        {!backHref && (
          <Link
            href="/settings"
            className="flex h-10 items-center rounded-full px-3 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            Cài đặt
          </Link>
        )}
      </div>
    </header>
  );
}
