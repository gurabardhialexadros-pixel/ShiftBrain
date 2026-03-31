"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── icons ────────────────────────────────────────────────────────────────────

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.25 12L11.204 3.045a1.125 1.125 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
  </svg>
);

const MoonIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>
  </svg>
);

const CheckIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
  </svg>
);

const MealsIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z"/>
  </svg>
);

// Running figure — identical to the one used in the workout card
const WorkoutsIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM9.9 8.6 8.1 16H6a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 .73-.57l.54-2.18 1.54 1.54A.75.75 0 0 0 12 16.5V13l2.47 2.47a.75.75 0 0 0 1.06-1.06l-3-3A.75.75 0 0 0 12 11.25h-.08l.33-1.32 1 1A.75.75 0 0 0 14 11.25h3a.75.75 0 0 0 0-1.5h-2.64l-1.77-1.77a1.5 1.5 0 0 0-2.1-.07L9 9.27l.09-.36A.75.75 0 1 0 7.65 8.5l-.08.32A1.5 1.5 0 0 0 9.9 8.6Z"/>
  </svg>
);

// ─── nav items ────────────────────────────────────────────────────────────────

const NAV = [
  { href: "/dashboard", label: "Home",     Icon: HomeIcon     },
  { href: "/sleep",     label: "Sleep",    Icon: MoonIcon     },
  { href: "/routine",   label: "Routine",  Icon: CheckIcon    },
  { href: "/meals",     label: "Meals",    Icon: MealsIcon    },
  { href: "/gym",       label: "Workouts", Icon: WorkoutsIcon },
];

// ─── component ────────────────────────────────────────────────────────────────

export default function BottomNav() {
  const pathname = usePathname();

  return (
    /* outer: positions the pill floating above the bottom edge */
    <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-6 safe-bottom">
      <nav
        className="flex items-center rounded-[36px] px-2 py-2"
        style={{
          background: "rgba(26,26,28,0.92)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || (href === "/gym" && pathname === "/gym");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-[3px] py-2 rounded-[28px] transition-all duration-200"
              style={active ? {
                background: "rgba(163,230,53,0.13)",
                boxShadow: "inset 0 1px 0 rgba(163,230,53,0.12)",
              } : undefined}
            >
              <span style={{ color: active ? "#a3e635" : "#6b7280" }}>
                <Icon active={active} />
              </span>
              <span
                className="text-[10px] font-semibold leading-none tracking-wide"
                style={{ color: active ? "#a3e635" : "#6b7280" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
