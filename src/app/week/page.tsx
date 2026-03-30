"use client";

import { useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { type UserProfile, DEFAULT_PROFILE } from "@/lib/profile";
import type { SleepSchedule, Shift } from "@/lib/types";
import { formatDuration, sleepDuration } from "@/lib/utils/time";
import { defaultWeekRotation, getWorkoutById } from "@/lib/data/workouts";
import { meals } from "@/lib/data/meals";

const DEFAULT_SLEEP: SleepSchedule = {
  bedtime: { hours: 23, minutes: 0 },
  wakeTime: { hours: 10, minutes: 30 },
  targetHours: 8,
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ROUTINE_TOTAL = 9;

function getWeekDates(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toISOString().split("T")[0];
  });
}

function dayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function isToday(iso: string): boolean {
  return iso === new Date().toISOString().split("T")[0];
}

function workoutForDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
  return getWorkoutById(defaultWeekRotation[idx]);
}

const gymTypeColor: Record<string, string> = {
  push: "#6366f1", pull: "#8b5cf6", legs: "#ec4899",
  "active-recovery": "#10b981", rest: "#52525b", cardio: "#f59e0b",
};

export default function WeekPage() {
  const [profile]  = useLocalStorage<UserProfile>("sb-profile", DEFAULT_PROFILE);
  const [sleep]    = useLocalStorage<SleepSchedule>("sb-sleep", DEFAULT_SLEEP);
  const [routine]  = useLocalStorage<Record<string, string[]>>("sb-routine-completed", {});
  const [mealLog]  = useLocalStorage<Record<string, string[]>>("sb-meals-log", {});
  const [shifts]   = useLocalStorage<Shift[]>("sb-shifts", []);

  const CALORIE_GOAL = profile.calorieGoal || 2400;

  const weekDates = useMemo(() => getWeekDates(), []);

  const days = useMemo(() =>
    weekDates.map((date) => {
      const completedTasks = routine[date]?.length ?? 0;
      const routinePct = Math.round((completedTasks / ROUTINE_TOTAL) * 100);

      const loggedIds = mealLog[date] ?? [];
      const calories = meals
        .filter((m) => loggedIds.includes(m.id))
        .reduce((s, m) => s + m.calories, 0);
      const caloriePct = Math.min(100, Math.round((calories / CALORIE_GOAL) * 100));

      const workout = workoutForDate(date);
      const shift = shifts.find((s) => s.date === date) ?? null;

      return { date, routinePct, calories, caloriePct, workout, shift, label: dayLabel(date), today: isToday(date) };
    }),
    [weekDates, routine, mealLog, shifts, CALORIE_GOAL]
  );

  // Weekly averages
  const avgRoutine  = Math.round(days.reduce((s, d) => s + d.routinePct, 0) / 7);
  const avgCalories = Math.round(days.reduce((s, d) => s + d.calories, 0) / 7);
  const gymDays     = days.filter((d) => d.workout.type !== "rest" && d.workout.type !== "active-recovery").length;
  const shiftCount  = days.filter((d) => d.shift).length;
  const sleepMins   = sleepDuration(sleep.bedtime, sleep.wakeTime);
  const sleepOk     = sleepMins >= sleep.targetHours * 60 - 30;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header title="Weekly Summary" subtitle="Last 7 days" />

      <main className="flex-1 px-4 py-5 pb-28 max-w-md mx-auto w-full space-y-5">

        {/* Top stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Avg Routine",  value: `${avgRoutine}%`,            sub: "daily completion",  ok: avgRoutine >= 50,  emoji: "✅" },
            { label: "Avg Calories", value: `${avgCalories.toLocaleString()}`, sub: `goal ${CALORIE_GOAL}`, ok: avgCalories >= CALORIE_GOAL * 0.7, emoji: "🍽️" },
            { label: "Sleep",        value: formatDuration(sleepMins),    sub: `target ${sleep.targetHours}h`, ok: sleepOk, emoji: "🌙" },
            { label: "Shifts",       value: `${shiftCount}`,             sub: "this week",          ok: true,              emoji: "💼" },
          ].map(({ label, value, sub, ok, emoji }) => (
            <div key={label} className="rounded-2xl bg-surface-card border border-zinc-800 p-4">
              <div className="flex items-start justify-between">
                <span className="text-xl">{emoji}</span>
                <span className={`text-xs font-semibold ${ok ? "text-emerald-400" : "text-amber-400"}`}>
                  {ok ? "●" : "○"}
                </span>
              </div>
              <p className="text-2xl font-bold text-zinc-100 mt-2">{value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              <p className="text-xs text-zinc-600">{sub}</p>
            </div>
          ))}
        </div>

        {/* Day-by-day heatmap */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Day by Day</h2>
          <div className="space-y-2">
            {days.map((day) => (
              <div
                key={day.date}
                className={[
                  "rounded-2xl border p-4 space-y-3",
                  day.today ? "border-brand/40 bg-brand/5" : "border-zinc-800 bg-surface-card",
                ].join(" ")}
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${day.today ? "text-brand-light" : "text-zinc-300"}`}>
                      {day.label}
                    </p>
                    {day.today && (
                      <span className="text-[10px] font-semibold bg-brand/20 text-brand-light rounded-full px-2 py-0.5">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Workout dot */}
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: gymTypeColor[day.workout.type] }}
                      title={day.workout.name}
                    />
                    {day.shift && (
                      <span className="text-xs text-violet-400">💼</span>
                    )}
                  </div>
                </div>

                {/* Bars */}
                <div className="space-y-2">
                  {/* Routine bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500">Routine</span>
                      <span className={day.routinePct > 0 ? "text-zinc-300" : "text-zinc-600"}>
                        {day.routinePct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${day.routinePct}%` }}
                      />
                    </div>
                  </div>

                  {/* Calorie bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500">Calories</span>
                      <span className={day.calories > 0 ? "text-zinc-300" : "text-zinc-600"}>
                        {day.calories > 0 ? `${day.calories} kcal` : "—"}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${day.caloriePct >= 100 ? "bg-emerald-500" : "bg-amber-500"}`}
                        style={{ width: `${day.caloriePct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Workout + shift tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-medium rounded-full px-2.5 py-0.5"
                    style={{
                      backgroundColor: `${gymTypeColor[day.workout.type]}20`,
                      color: gymTypeColor[day.workout.type],
                    }}
                  >
                    {day.workout.name}
                  </span>
                  {day.shift && (
                    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-violet-900/30 text-violet-400">
                      {day.shift.role}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Weekly gym breakdown */}
        <section className="rounded-2xl bg-surface-card border border-zinc-800 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300">This Week's Gym Plan</h2>
          <div className="flex gap-1.5">
            {days.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                <p className={`text-[10px] font-semibold ${day.today ? "text-brand-light" : "text-zinc-600"}`}>
                  {day.label}
                </p>
                <div
                  className="h-8 w-full rounded-lg flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: `${gymTypeColor[day.workout.type]}20`,
                    border: day.today ? `1px solid ${gymTypeColor[day.workout.type]}60` : "1px solid transparent",
                  }}
                >
                  {day.workout.type === "rest" ? "😴" :
                   day.workout.type === "active-recovery" ? "🧘" :
                   day.workout.type === "push" ? "⬆️" :
                   day.workout.type === "pull" ? "⬇️" : "🦵"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/plan",    label: "Plan Today",  emoji: "🧠" },
            { href: "/profile", label: "Edit Goals",  emoji: "⚙️" },
          ].map(({ href, label, emoji }) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl bg-surface-card border border-zinc-800 p-4 flex items-center gap-3 hover:border-zinc-700 transition-colors"
            >
              <span className="text-xl">{emoji}</span>
              <p className="text-sm font-medium text-zinc-300">{label}</p>
            </Link>
          ))}
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
