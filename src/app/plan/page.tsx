"use client";

import { useMemo } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { SleepSchedule, Shift } from "@/lib/types";
import { buildDayPlan, type PlanEvent, type DayInsight } from "@/lib/utils/dayPlanner";
import { defaultWeekRotation, getWorkoutById } from "@/lib/data/workouts";
import { formatTime24, formatTime } from "@/lib/utils/time";

const DEFAULT_SLEEP: SleepSchedule = {
  bedtime: { hours: 23, minutes: 0 },
  wakeTime: { hours: 10, minutes: 30 },
  targetHours: 8,
};

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const now = new Date();
const TODAY = now.toISOString().split("T")[0];
const dateLabel = `${DAY_NAMES[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}`;
const dayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;

const categoryStyles: Record<PlanEvent["category"], { bg: string; dot: string; text: string }> = {
  wake:     { bg: "bg-amber-900/30 border-amber-800/50",   dot: "bg-amber-400",   text: "text-amber-300" },
  hygiene:  { bg: "bg-sky-900/30 border-sky-800/50",       dot: "bg-sky-400",     text: "text-sky-300" },
  meal:     { bg: "bg-emerald-900/30 border-emerald-800/50", dot: "bg-emerald-400", text: "text-emerald-300" },
  gym:      { bg: "bg-indigo-900/30 border-indigo-800/50", dot: "bg-indigo-400",  text: "text-indigo-300" },
  shift:    { bg: "bg-violet-900/30 border-violet-800/50", dot: "bg-violet-400",  text: "text-violet-300" },
  commute:  { bg: "bg-zinc-800/60 border-zinc-700/50",     dot: "bg-zinc-500",    text: "text-zinc-400" },
  recovery: { bg: "bg-teal-900/30 border-teal-800/50",     dot: "bg-teal-400",    text: "text-teal-300" },
  prep:     { bg: "bg-zinc-800/60 border-zinc-700/50",     dot: "bg-zinc-500",    text: "text-zinc-400" },
  buffer:   { bg: "bg-zinc-800/40 border-zinc-700/40",     dot: "bg-zinc-600",    text: "text-zinc-500" },
  sleep:    { bg: "bg-indigo-900/40 border-indigo-800/60", dot: "bg-indigo-500",  text: "text-indigo-300" },
};

const insightBg: Record<DayInsight["type"], string> = {
  positive: "bg-emerald-900/30 border-emerald-800/50",
  warning:  "bg-amber-900/30 border-amber-800/50",
  info:     "bg-sky-900/30 border-sky-800/50",
};

export default function PlanPage() {
  const [sleep] = useLocalStorage<SleepSchedule>("sb-sleep", DEFAULT_SLEEP);
  const [shifts] = useLocalStorage<Shift[]>("sb-shifts", []);

  const todayShift = shifts.find((s) => s.date === TODAY) ?? null;
  const todayWorkout = getWorkoutById(defaultWeekRotation[dayIdx]);

  const plan = useMemo(
    () => buildDayPlan(sleep, todayShift, todayWorkout),
    [sleep, todayShift, todayWorkout]
  );

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header
        title="Plan My Day"
        subtitle={dateLabel}
      />

      <main className="flex-1 px-4 py-5 pb-28 max-w-md mx-auto w-full space-y-5">

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-surface-card border border-zinc-800 p-3 text-center">
            <p className="text-base font-bold text-zinc-100">
              {plan.gymLocation === "none" || plan.gymLocation === "free" && !todayShift
                ? todayWorkout.type === "rest" ? "Rest" : "Free"
                : plan.gymLocation === "pre-shift" ? "Pre-shift" : "Post-shift"}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Gym slot</p>
          </div>
          <div className="rounded-2xl bg-surface-card border border-zinc-800 p-3 text-center">
            <p className="text-base font-bold text-zinc-100">{plan.totalCalories}</p>
            <p className="text-xs text-zinc-500 mt-0.5">kcal planned</p>
          </div>
          <div className="rounded-2xl bg-surface-card border border-zinc-800 p-3 text-center">
            <p className="text-base font-bold text-zinc-100">{plan.events.length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">events</p>
          </div>
        </div>

        {/* Insights */}
        <section className="space-y-2">
          {plan.insights.map((insight, i) => (
            <div
              key={i}
              className={`rounded-2xl border px-4 py-3 flex items-start gap-3 ${insightBg[insight.type]}`}
            >
              <span className="text-base flex-shrink-0 mt-0.5">{insight.emoji}</span>
              <p className="text-sm text-zinc-300 leading-relaxed">{insight.message}</p>
            </div>
          ))}
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Today's Timeline</h2>
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-zinc-800" />

            <div className="space-y-2">
              {plan.events.map((event, idx) => {
                const style = categoryStyles[event.category];
                const isLast = idx === plan.events.length - 1;

                return (
                  <div key={event.id} className="flex items-start gap-3">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center flex-shrink-0 pt-3.5">
                      <div className={`h-3.5 w-3.5 rounded-full border-2 border-surface z-10 ${style.dot}`} />
                    </div>

                    {/* Card */}
                    <div
                      className={`flex-1 rounded-2xl border px-4 py-3 ${style.bg} ${
                        event.category === "gym" ? "shadow-[0_0_0_1px_rgba(99,102,241,0.2)]" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-lg flex-shrink-0">{event.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${
                              event.category === "buffer" ? "text-zinc-500" : "text-zinc-100"
                            }`}>
                              {event.label}
                            </p>
                            {event.detail && (
                              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                                {event.detail}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Time */}
                        <div className="text-right flex-shrink-0">
                          <p className={`text-xs font-mono font-semibold ${style.text}`}>
                            {formatTime24(event.startTime)}
                          </p>
                          {event.endTime && (
                            <p className="text-xs font-mono text-zinc-600">
                              {formatTime24(event.endTime)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Calories badge */}
                      {event.calories && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-900/40 border border-emerald-800/40 px-2.5 py-0.5">
                          <span className="text-xs font-medium text-emerald-400">
                            {event.calories} kcal
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Calorie total */}
        <div className="rounded-2xl bg-surface-card border border-zinc-800 p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-zinc-300">Planned Calories</p>
            <p className="text-sm font-bold text-zinc-100">{plan.totalCalories} / 2400 kcal</p>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, Math.round((plan.totalCalories / 2400) * 100))}%` }}
            />
          </div>
          {plan.totalCalories < 2400 && (
            <p className="text-xs text-zinc-600 mt-1.5">
              Add {2400 - plan.totalCalories} kcal via snacks or larger portions to hit your goal.
            </p>
          )}
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
