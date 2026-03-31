"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  back?: boolean;
}

export default function Header({ title, subtitle, action, back }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 bg-surface/90 px-4 py-4 backdrop-blur-md border-b border-zinc-800/60">
      {back && (
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-zinc-100 truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}
