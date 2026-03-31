"use client";

import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultWeekRotation, getWorkoutById, intensityColor } from "@/lib/data/workouts";
import type { SleepSchedule, Shift } from "@/lib/types";
import { type UserProfile, DEFAULT_PROFILE } from "@/lib/profile";
import { formatTime, formatDuration, sleepDuration, addMinutes, formatTime24 } from "@/lib/utils/time";
import { meals } from "@/lib/data/meals";

// ─── helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_SLEEP: SleepSchedule = {
  bedtime: { hours: 2, minutes: 0 },
  wakeTime: { hours: 10, minutes: 0 },
  targetHours: 8,
};

const TODAY_DATE = new Date().toISOString().split("T")[0];
const DAY_NAMES  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const now = new Date();
const dateLabel = `${DAY_NAMES[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}`;
const dayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;
const todayWorkoutId = defaultWeekRotation[dayIdx];

// ─── sub-components ───────────────────────────────────────────────────────────

/** Multi-coloured sparkle cluster — matches the Figma AI card icon */
function SparkleCluster() {
  return (
    <svg width="64" height="56" viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Large cyan star */}
      <path d="M44 4 L46.5 14 L56 16.5 L46.5 19 L44 29 L41.5 19 L32 16.5 L41.5 14 Z"
        fill="#22d3ee" />
      {/* Large purple star */}
      <path d="M20 18 L22 26 L30 28 L22 30 L20 38 L18 30 L10 28 L18 26 Z"
        fill="#a78bfa" />
      {/* Small blue star */}
      <path d="M52 32 L53.2 37 L58 38 L53.2 39 L52 44 L50.8 39 L46 38 L50.8 37 Z"
        fill="#60a5fa" />
      {/* Small cyan star */}
      <path d="M30 6 L31 10 L35 11 L31 12 L30 16 L29 12 L25 11 L29 10 Z"
        fill="#67e8f9" />
    </svg>
  );
}

/** Small icon wrapped in a gray circle */
function IconCircle({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-9 w-9 rounded-full bg-surface-elevated flex items-center justify-center flex-shrink-0">
      {children}
    </div>
  );
}

/** Chevron-in-circle navigation arrow */
function ChevronCircle() {
  return (
    <div className="h-7 w-7 rounded-full bg-surface-elevated flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-zinc-400">
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/** Pill badge variants */
function Badge({ children, variant = "lime" }: { children: React.ReactNode; variant?: "lime" | "amber" | "red" }) {
  const styles = {
    lime:  "border-accent text-accent",
    amber: "border-amber-400 text-amber-400",
    red:   "border-rose-400 text-rose-400",
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold flex-shrink-0 ${styles[variant]}`}>
      {children}
    </span>
  );
}

/** 2-column stat card with progress bar */
function StatCard({
  icon, value, label, sub, progress,
}: {
  icon: React.ReactNode; value: string; label: string; sub: string; progress: number;
}) {
  return (
    <div className="rounded-2xl bg-surface-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <IconCircle>{icon}</IconCircle>
        <ChevronCircle />
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        <p className="text-[13px] text-white mt-0.5 leading-tight">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
}

/** Full-width info card */
function InfoCard({
  icon, label, mainLine, subLine, badge, href,
}: {
  icon: React.ReactNode;
  label: string;
  mainLine: React.ReactNode;
  subLine: string;
  badge?: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="rounded-2xl bg-surface-card p-4 space-y-2">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <IconCircle>{icon}</IconCircle>
            <span className="text-[13px] text-zinc-400 font-medium">{label}</span>
          </div>
          <ChevronCircle />
        </div>
        {/* Main content */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[18px] font-bold text-white leading-snug">{mainLine}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{subLine}</p>
          </div>
          {badge}
        </div>
      </div>
    </Link>
  );
}

// ─── SVG icons ────────────────────────────────────────────────────────────────

const MoonIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-zinc-200">
    <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clipRule="evenodd"/>
  </svg>
);

const RunnerIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-zinc-200">
    <path d="M10 3.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM5.5 8.5A1.5 1.5 0 0 1 7 7h2l2.5-2.5a1.5 1.5 0 0 1 2.12 2.12L11 9.24V13h2.5a1.5 1.5 0 0 1 0 3H11a1.5 1.5 0 0 1-1.5-1.5v-4.25L7 12.5v3a1.5 1.5 0 0 1-3 0v-3.72A1.5 1.5 0 0 1 5.5 8.5Z"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-zinc-200">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd"/>
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-zinc-200">
    <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-zinc-200">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd"/>
  </svg>
);

const ClocheIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-zinc-200">
    <path d="M10 2a.75.75 0 0 1 .75.75v.268a7.25 7.25 0 0 1 6.25 7.232H3a7.25 7.25 0 0 1 6.25-7.232V2.75A.75.75 0 0 1 10 2ZM2.75 11.5a.75.75 0 0 0 0 1.5h14.5a.75.75 0 0 0 0-1.5H2.75ZM2 14.75a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"/>
  </svg>
);

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [sleep]           = useLocalStorage<SleepSchedule>("sb-sleep", DEFAULT_SLEEP);
  const [routineCompleted]= useLocalStorage<Record<string, string[]>>("sb-routine-completed", {});
  const [mealLog]         = useLocalStorage<Record<string, string[]>>("sb-meals-log", {});
  const [shifts]          = useLocalStorage<Shift[]>("sb-shifts", []);
  const [profile]         = useLocalStorage<UserProfile>("sb-profile", DEFAULT_PROFILE);

  const todayWorkout = getWorkoutById(todayWorkoutId);

  const actualSleep  = sleepDuration(sleep.bedtime, sleep.wakeTime);
  const sleepOk      = actualSleep >= sleep.targetHours * 60 - 30;

  const todayRoutine = routineCompleted[TODAY_DATE] ?? [];
  const routineTotal = 9;
  const routinePct   = Math.round((todayRoutine.length / routineTotal) * 100);

  const todayMealIds  = mealLog[TODAY_DATE] ?? [];
  const todayCalories = meals
    .filter((m) => todayMealIds.includes(m.id))
    .reduce((s, m) => s + m.calories, 0);
  const CALORIE_GOAL = profile.calorieGoal || 2400;
  const caloriePct   = Math.min(100, Math.round((todayCalories / CALORIE_GOAL) * 100));

  const nextShift = shifts
    .filter((s) => s.date >= TODAY_DATE)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.hours - b.startTime.hours)[0] ?? null;

  const gymTime = addMinutes(sleep.wakeTime, 90);

  const intensityBadgeVariant = (i: string) =>
    i === "high" ? "amber" : i === "rest" ? "lime" : "lime";

  return (
    <div className="min-h-screen bg-surface pb-36">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-5">
        <div>
          <h1 className="text-[28px] font-bold text-white leading-tight">
            Hey, {profile.name || "there"}
          </h1>
        </div>
        <Link href="/profile">
          <div className="h-11 w-11 rounded-full bg-surface-card border border-zinc-700 overflow-hidden flex items-center justify-center">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt="profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl">{profile.avatarEmoji || "💪"}</span>
            )}
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-800 mx-5 mb-5" />

      <div className="px-4 space-y-3">
        {/* ── AI Scheduler card ── */}
        <Link href="/plan">
          <div
            className="rounded-2xl p-5 flex items-center justify-between gap-4"
            style={{
              background: "linear-gradient(#1c1c1e, #1c1c1e) padding-box, linear-gradient(135deg, #22d3ee 0%, #8b5cf6 55%, #3b82f6 100%) border-box",
              border: "1.5px solid transparent",
            }}
          >
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-400 font-medium">AI Sheduler</p>
              <p className="text-[22px] font-bold text-white leading-tight">Plan my day</p>
              <p className="text-sm text-zinc-400">Optimise your timeline for today</p>
            </div>
            <SparkleCluster />
          </div>
        </Link>

        {/* ── Summary header ── */}
        <div className="flex items-start justify-between pt-2 pb-1">
          <div>
            <p className="text-[22px] font-bold text-white leading-tight">Summary</p>
            <p className="text-sm text-zinc-500">{dateLabel}</p>
          </div>
          <Link href="/week">
            <div className="h-8 w-8 rounded-full bg-surface-elevated flex items-center justify-center mt-1">
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-zinc-300">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* ── 2-col stat cards ── */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/routine">
            <StatCard
              icon={<CheckCircleIcon />}
              value={`${routinePct}%`}
              label="Avg. Routine"
              sub="Daily completion"
              progress={routinePct}
            />
          </Link>
          <Link href="/meals">
            <StatCard
              icon={<ClocheIcon />}
              value={todayCalories.toLocaleString()}
              label="Calories consumed today"
              sub="Daily completion"
              progress={caloriePct}
            />
          </Link>
        </div>

        {/* ── Upcoming Sleep ── */}
        <InfoCard
          href="/sleep"
          icon={<MoonIcon />}
          label="Upcoming Sleep"
          mainLine={`${formatTime(sleep.bedtime)} → ${formatTime(sleep.wakeTime)}`}
          subLine={`Target Sleep ${sleep.targetHours}h`}
          badge={<Badge variant={sleepOk ? "lime" : "amber"}>{sleepOk ? "On Track" : "Short"}</Badge>}
        />

        {/* ── Upcoming Workout ── */}
        <InfoCard
          href="/gym"
          icon={<RunnerIcon />}
          label="Upcoming Workout"
          mainLine={todayWorkout.name}
          subLine={
            todayWorkout.type !== "rest"
              ? `Recommended at ${formatTime(gymTime)} · ${todayWorkout.durationMinutes} min`
              : "Rest day — recover well"
          }
          badge={
            todayWorkout.type !== "rest" ? (
              <Badge variant={intensityBadgeVariant(todayWorkout.intensity)}>
                {todayWorkout.intensity.charAt(0).toUpperCase() + todayWorkout.intensity.slice(1)}
              </Badge>
            ) : undefined
          }
        />

        {/* ── Upcoming Shift ── */}
        <InfoCard
          href="/shifts"
          icon={<ClockIcon />}
          label="Upcoming Shift"
          mainLine={
            nextShift
              ? `${formatTime24(nextShift.startTime)} → ${formatTime24(nextShift.endTime)}`
              : "No shifts added yet"
          }
          subLine={
            nextShift
              ? `${nextShift.role}${nextShift.location ? " · " + nextShift.location : ""}`
              : "Tap to add your first shift"
          }
          badge={
            nextShift ? (
              <Badge variant="lime">
                {nextShift.date === TODAY_DATE ? "Today" : "Upcoming"}
              </Badge>
            ) : undefined
          }
        />

        {/* ── Last 7 Days ── */}
        <InfoCard
          href="/week"
          icon={<GridIcon />}
          label="Last 7 Days"
          mainLine="Weekly Summary"
          subLine="Routine · Calories · Gym · Shifts"
          badge={<Badge variant="lime">Track your week</Badge>}
        />
      </div>

      <BottomNav />
    </div>
  );
}
