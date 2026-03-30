"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultWeekRotation, getWorkoutById, intensityColor } from "@/lib/data/workouts";
import type { SleepSchedule, Shift } from "@/lib/types";
import { type UserProfile, DEFAULT_PROFILE } from "@/lib/profile";
import { formatTime, formatDuration, sleepDuration, addMinutes, formatTime24 } from "@/lib/utils/time";
import { meals } from "@/lib/data/meals";

const typeIcon: Record<string, string> = {
  push: "⬆️", pull: "⬇️", legs: "🦵", cardio: "🏃",
  "active-recovery": "🧘", rest: "😴",
};

const DEFAULT_SLEEP: SleepSchedule = {
  bedtime: { hours: 23, minutes: 0 },
  wakeTime: { hours: 10, minutes: 30 },
  targetHours: 8,
};

const TODAY_DATE = new Date().toISOString().split("T")[0];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const now = new Date();
const dateLabel = `${DAY_NAMES[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}`;

// Today's workout (based on current day of week, Mon=0)
const dayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;
const todayWorkoutId = defaultWeekRotation[dayIdx];

export default function Dashboard() {
  const [sleep] = useLocalStorage<SleepSchedule>("sb-sleep", DEFAULT_SLEEP);
  const [routineCompleted] = useLocalStorage<Record<string, string[]>>("sb-routine-completed", {});
  const [mealLog] = useLocalStorage<Record<string, string[]>>("sb-meals-log", {});
  const [shifts] = useLocalStorage<Shift[]>("sb-shifts", []);
  const [profile] = useLocalStorage<UserProfile>("sb-profile", DEFAULT_PROFILE);

  const todayWorkout = getWorkoutById(todayWorkoutId);
  const gymTime = addMinutes(sleep.wakeTime, 90);

  const actualSleep = sleepDuration(sleep.bedtime, sleep.wakeTime);
  const sleepTarget = sleep.targetHours * 60;
  const sleepOk = actualSleep >= sleepTarget - 30;

  const todayRoutine = routineCompleted[TODAY_DATE] ?? [];
  const routineTotal = 9;
  const routinePct = Math.round((todayRoutine.length / routineTotal) * 100);

  const todayMealIds = mealLog[TODAY_DATE] ?? [];
  const todayCalories = meals
    .filter((m) => todayMealIds.includes(m.id))
    .reduce((s, m) => s + m.calories, 0);

  const CALORIE_GOAL = profile.calorieGoal || 2400;
  const caloriePct = Math.min(100, Math.round((todayCalories / CALORIE_GOAL) * 100));

  const nextShift = shifts
    .filter((s) => s.date >= TODAY_DATE)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.hours - b.startTime.hours)[0] ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header
        title={profile.name ? `Hey, ${profile.name} 👋` : "ShiftBrain"}
        subtitle={dateLabel}
        action={
          <div className="h-8 w-8 rounded-full bg-surface-card border border-zinc-700 flex items-center justify-center text-base">
            {profile.avatarEmoji || "💪"}
          </div>
        }
      />

      <main className="flex-1 px-4 py-5 pb-28 max-w-md mx-auto w-full space-y-4">
        {/* Plan My Day CTA */}
        <Link href="/plan">
          <div className="rounded-2xl border border-brand/40 bg-brand/10 px-4 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-brand-light font-medium mb-0.5">AI Scheduler</p>
              <p className="text-base font-bold text-zinc-100">Plan My Day</p>
              <p className="text-xs text-zinc-500 mt-0.5">Optimised timeline for today</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-brand/20 flex items-center justify-center text-2xl flex-shrink-0">
              🧠
            </div>
          </div>
        </Link>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Sleep", value: formatDuration(actualSleep), ok: sleepOk },
            { label: "Routine", value: `${routinePct}%`, ok: routinePct >= 50 },
            { label: "Calories", value: `${todayCalories}`, ok: caloriePct >= 30 },
          ].map(({ label, value, ok }) => (
            <Card key={label} className="text-center py-3 px-2">
              <p className={`text-lg font-bold ${ok ? "text-zinc-100" : "text-amber-400"}`}>{value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        {/* Today's workout card */}
        <Link href="/gym">
          <div
            className="rounded-2xl border p-4 flex items-center gap-4"
            style={{ borderColor: `${todayWorkout.color}40`, background: `${todayWorkout.color}0d` }}
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${todayWorkout.color}20` }}
            >
              {typeIcon[todayWorkout.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 mb-0.5">Today's workout</p>
              <p className="text-sm font-semibold text-zinc-100">{todayWorkout.name}</p>
              {todayWorkout.type !== "rest" && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  Recommended at {formatTime(gymTime)} · {todayWorkout.durationMinutes} min
                </p>
              )}
            </div>
            <span className={`text-xs font-semibold flex-shrink-0 ${intensityColor[todayWorkout.intensity]}`}>
              {todayWorkout.intensity}
            </span>
          </div>
        </Link>

        {/* Sleep summary */}
        <Link href="/sleep">
          <Card className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-indigo-900/40 flex items-center justify-center text-xl flex-shrink-0">
              🌙
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 mb-0.5">Sleep schedule</p>
              <p className="text-sm font-semibold text-zinc-100">
                {formatTime(sleep.bedtime)} → {formatTime(sleep.wakeTime)}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {formatDuration(actualSleep)} · target {sleep.targetHours}h
              </p>
            </div>
            <Badge variant={sleepOk ? "success" : "warning"}>
              {sleepOk ? "On track" : "Short"}
            </Badge>
          </Card>
        </Link>

        {/* Morning routine progress */}
        <Link href="/routine">
          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-300">Morning Routine</p>
              <p className="text-xs text-zinc-500">{todayRoutine.length}/{routineTotal}</p>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${routinePct}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500">
              {routinePct === 100
                ? "All done for today 🎉"
                : routinePct === 0
                ? "Tap to start your routine"
                : `${routineTotal - todayRoutine.length} tasks remaining`}
            </p>
          </Card>
        </Link>

        {/* Meals summary */}
        <Link href="/meals">
          <Card className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-900/40 flex items-center justify-center text-xl flex-shrink-0">
              🍽️
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 mb-0.5">Calories today</p>
              <p className="text-sm font-semibold text-zinc-100">
                {todayCalories.toLocaleString()} / {CALORIE_GOAL.toLocaleString()} kcal
              </p>
              <div className="h-1.5 mt-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${caloriePct}%` }}
                />
              </div>
            </div>
            <Badge variant={caloriePct >= 80 ? "success" : "warning"}>
              {caloriePct}%
            </Badge>
          </Card>
        </Link>

        {/* Next shift */}
        <Link href="/shifts">
          <Card elevated className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-brand/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-brand-light">
                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 mb-0.5">Next shift</p>
              {nextShift ? (
                <>
                  <p className="text-sm font-semibold text-zinc-100">{nextShift.role}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {formatTime24(nextShift.startTime)} · {nextShift.location}
                  </p>
                </>
              ) : (
                <p className="text-sm text-zinc-500">No upcoming shifts — add one</p>
              )}
            </div>
            {nextShift && (
              <Badge variant={nextShift.date === TODAY_DATE ? "info" : "default"}>
                {nextShift.date === TODAY_DATE ? "Today" : nextShift.date}
              </Badge>
            )}
          </Card>
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}
