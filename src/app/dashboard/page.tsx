"use client";

import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultWeekRotation, getWorkoutById } from "@/lib/data/workouts";
import type { SleepSchedule, Shift } from "@/lib/types";
import { type UserProfile, DEFAULT_PROFILE } from "@/lib/profile";
import { formatTime, sleepDuration, addMinutes, formatTime24 } from "@/lib/utils/time";
import { meals } from "@/lib/data/meals";

// ─── constants ────────────────────────────────────────────────────────────────

const DEFAULT_SLEEP: SleepSchedule = {
  bedtime: { hours: 2, minutes: 0 },
  wakeTime: { hours: 10, minutes: 0 },
  targetHours: 8,
};

const TODAY_DATE  = new Date().toISOString().split("T")[0];
const DAY_NAMES   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const now         = new Date();
const dateLabel   = `${DAY_NAMES[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}`;
const dayIdx      = now.getDay() === 0 ? 6 : now.getDay() - 1;
const todayWorkoutId = defaultWeekRotation[dayIdx];

// ─── shared glass card style ──────────────────────────────────────────────────

const glass: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(50,50,53,0.9) 0%, rgba(28,28,30,0.95) 55%, rgba(20,20,22,1) 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 20px rgba(0,0,0,0.45)",
};

// ─── SVG icons (all 20×20) ────────────────────────────────────────────────────

const MoonIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px] text-zinc-200">
    <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clipRule="evenodd"/>
  </svg>
);

// Consistent running figure used in BOTH the card and the nav
export const RunnerSVG = ({ className = "h-[18px] w-[18px]" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`text-zinc-200 ${className}`}>
    <path d="M13.5 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM9.9 8.6 8.1 16H6a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 .73-.57l.54-2.18 1.54 1.54A.75.75 0 0 0 12 16.5V13l2.47 2.47a.75.75 0 0 0 1.06-1.06l-3-3A.75.75 0 0 0 12 11.25h-.08l.33-1.32 1 1A.75.75 0 0 0 14 11.25h3a.75.75 0 0 0 0-1.5h-2.64l-1.77-1.77a1.5 1.5 0 0 0-2.1-.07L9 9.27l.09-.36A.75.75 0 1 0 7.65 8.5l-.08.32A1.5 1.5 0 0 0 9.9 8.6Z"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px] text-zinc-200">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd"/>
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px] text-zinc-200">
    <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px] text-zinc-200">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd"/>
  </svg>
);

const ClocheIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px] text-zinc-200">
    <path d="M10 2a.75.75 0 0 1 .75.75v.268a7.25 7.25 0 0 1 6.25 7.232H3a7.25 7.25 0 0 1 6.25-7.232V2.75A.75.75 0 0 1 10 2ZM2.75 11.5a.75.75 0 0 0 0 1.5h14.5a.75.75 0 0 0 0-1.5H2.75ZM2 14.75a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"/>
  </svg>
);

// ─── sub-components ───────────────────────────────────────────────────────────

function IconCircle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        background: "rgba(60,60,64,0.7)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function ChevronCircle() {
  return (
    <div
      className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        background: "rgba(60,60,64,0.6)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-zinc-400">
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/** Glass pill badge — transparent dark bg, lime border, lime text */
function Badge({ children, color = "lime" }: { children: React.ReactNode; color?: "lime" | "amber" }) {
  const borderColor = color === "lime" ? "rgba(163,230,53,0.5)" : "rgba(251,191,36,0.5)";
  const textColor   = color === "lime" ? "#a3e635" : "#fbbf24";
  return (
    <span
      className="rounded-full px-3 py-[5px] text-xs font-semibold flex-shrink-0 whitespace-nowrap"
      style={{
        background: "rgba(10,10,12,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${borderColor}`,
        color: textColor,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {children}
    </span>
  );
}

function SparkleCluster() {
  return (
    <svg width="62" height="54" viewBox="0 0 64 56" fill="none">
      <path d="M44 4 L46.5 14 L56 16.5 L46.5 19 L44 29 L41.5 19 L32 16.5 L41.5 14 Z" fill="#22d3ee"/>
      <path d="M20 18 L22 26 L30 28 L22 30 L20 38 L18 30 L10 28 L18 26 Z" fill="#a78bfa"/>
      <path d="M52 32 L53.2 37 L58 38 L53.2 39 L52 44 L50.8 39 L46 38 L50.8 37 Z" fill="#60a5fa"/>
      <path d="M30 6 L31 10 L35 11 L31 12 L30 16 L29 12 L25 11 L29 10 Z" fill="#67e8f9"/>
    </svg>
  );
}

/** 2-column stat card */
function StatCard({ icon, value, label, sub, progress }: {
  icon: React.ReactNode; value: string; label: string; sub: string; progress: number;
}) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={glass}>
      <div className="flex items-start justify-between">
        <IconCircle>{icon}</IconCircle>
        <ChevronCircle />
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        <p className="text-[13px] text-white/90 mt-0.5 leading-tight">{label}</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>
      </div>
      <div className="h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}/>
      </div>
    </div>
  );
}

/** Full-width info card */
function InfoCard({ icon, label, mainLine, subLine, badge, href }: {
  icon: React.ReactNode; label: string; mainLine: React.ReactNode;
  subLine: string; badge?: React.ReactNode; href: string;
}) {
  return (
    <Link href={href}>
      <div className="rounded-2xl p-4 space-y-2.5" style={glass}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconCircle>{icon}</IconCircle>
            <span className="text-[13px] text-zinc-400 font-medium">{label}</span>
          </div>
          <ChevronCircle />
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[19px] font-bold text-white leading-snug">{mainLine}</p>
            <p className="text-[12px] text-zinc-500 mt-0.5">{subLine}</p>
          </div>
          {badge}
        </div>
      </div>
    </Link>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [sleep]            = useLocalStorage<SleepSchedule>("sb-sleep", DEFAULT_SLEEP);
  const [routineCompleted] = useLocalStorage<Record<string, string[]>>("sb-routine-completed", {});
  const [mealLog]          = useLocalStorage<Record<string, string[]>>("sb-meals-log", {});
  const [shifts]           = useLocalStorage<Shift[]>("sb-shifts", []);
  const [profile]          = useLocalStorage<UserProfile>("sb-profile", DEFAULT_PROFILE);

  const todayWorkout  = getWorkoutById(todayWorkoutId);
  const actualSleep   = sleepDuration(sleep.bedtime, sleep.wakeTime);
  const sleepOk       = actualSleep >= sleep.targetHours * 60 - 30;

  const todayRoutine  = routineCompleted[TODAY_DATE] ?? [];
  const routinePct    = Math.round((todayRoutine.length / 9) * 100);

  const todayCalories = meals
    .filter((m) => (mealLog[TODAY_DATE] ?? []).includes(m.id))
    .reduce((s, m) => s + m.calories, 0);
  const caloriePct    = Math.min(100, Math.round((todayCalories / (profile.calorieGoal || 2400)) * 100));

  const nextShift = shifts
    .filter((s) => s.date >= TODAY_DATE)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.hours - b.startTime.hours)[0] ?? null;

  const gymTime = addMinutes(sleep.wakeTime, 90);

  return (
    <div className="min-h-screen bg-surface pb-36">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-5">
        <h1 className="text-[30px] font-bold text-white tracking-tight">
          Hey, {profile.name || "there"}
        </h1>
        <Link href="/profile">
          <div
            className="h-11 w-11 rounded-full overflow-hidden flex items-center justify-center"
            style={{ border: "1.5px solid rgba(255,255,255,0.12)", boxShadow: "0 0 0 1px rgba(255,255,255,0.04)" }}
          >
            {profile.photoUrl
              ? <img src={profile.photoUrl} alt="profile" className="h-full w-full object-cover"/>
              : <span className="text-xl bg-surface-card w-full h-full flex items-center justify-center">{profile.avatarEmoji || "💪"}</span>
            }
          </div>
        </Link>
      </div>

      {/* Hairline divider */}
      <div className="h-px mx-5 mb-6" style={{ background: "rgba(255,255,255,0.07)" }}/>

      <div className="px-5 flex flex-col gap-[14px]">

        {/* AI Scheduler */}
        <Link href="/plan">
          <div
            className="rounded-2xl p-5 flex items-center justify-between gap-4"
            style={{
              background: "linear-gradient(#1a1a1c, #1a1a1c) padding-box, linear-gradient(125deg, #22d3ee 0%, #8b5cf6 55%, #3b82f6 100%) border-box",
              border: "1.5px solid transparent",
              boxShadow: "0 4px 24px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-400 font-medium tracking-wide">AI Sheduler</p>
              <p className="text-[22px] font-bold text-white leading-tight">Plan my day</p>
              <p className="text-sm text-zinc-400">Optimise your timeline for today</p>
            </div>
            <SparkleCluster />
          </div>
        </Link>

        {/* Summary header */}
        <div className="flex items-start justify-between px-1 pt-1">
          <div>
            <p className="text-[22px] font-bold text-white leading-tight">Summary</p>
            <p className="text-sm text-zinc-500 mt-0.5">{dateLabel}</p>
          </div>
          <Link href="/week">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center mt-1"
              style={{ background: "rgba(60,60,64,0.6)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-zinc-300">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* 2-col stat cards */}
        <div className="grid grid-cols-2 gap-[14px]">
          <Link href="/routine"><StatCard icon={<CheckCircleIcon/>} value={`${routinePct}%`} label="Avg. Routine" sub="Daily completion" progress={routinePct}/></Link>
          <Link href="/meals"><StatCard icon={<ClocheIcon/>} value={todayCalories.toLocaleString()} label="Calories consumed today" sub="Daily completion" progress={caloriePct}/></Link>
        </div>

        {/* Upcoming Sleep */}
        <InfoCard
          href="/sleep" icon={<MoonIcon/>} label="Upcoming Sleep"
          mainLine={`${formatTime(sleep.bedtime)} → ${formatTime(sleep.wakeTime)}`}
          subLine={`Target Sleep ${sleep.targetHours}h`}
          badge={<Badge color={sleepOk ? "lime" : "amber"}>{sleepOk ? "On Track" : "Short"}</Badge>}
        />

        {/* Upcoming Workout */}
        <InfoCard
          href="/gym" icon={<RunnerSVG/>} label="Upcoming Workout"
          mainLine={todayWorkout.name}
          subLine={todayWorkout.type !== "rest" ? `Recommended at ${formatTime(gymTime)} · ${todayWorkout.durationMinutes} min` : "Rest day — recover well"}
          badge={todayWorkout.type !== "rest"
            ? <Badge color={todayWorkout.intensity === "high" ? "amber" : "lime"}>
                {todayWorkout.intensity.charAt(0).toUpperCase() + todayWorkout.intensity.slice(1)}
              </Badge>
            : undefined}
        />

        {/* Upcoming Shift */}
        <InfoCard
          href="/shifts" icon={<ClockIcon/>} label="Upcoming Shift"
          mainLine={nextShift ? `${formatTime24(nextShift.startTime)} → ${formatTime24(nextShift.endTime)}` : "No shifts added yet"}
          subLine={nextShift ? `${nextShift.role}${nextShift.location ? " · " + nextShift.location : ""}` : "Tap to add your first shift"}
          badge={nextShift ? <Badge color="lime">On Track</Badge> : undefined}
        />

        {/* Last 7 Days */}
        <InfoCard
          href="/week" icon={<GridIcon/>} label="Last 7 Days"
          mainLine="Weekly Summary"
          subLine="Routine · Calories · Gym · Shifts"
          badge={<Badge color="lime">Track your week</Badge>}
        />

      </div>
      <BottomNav />
    </div>
  );
}
