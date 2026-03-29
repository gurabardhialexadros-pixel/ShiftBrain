"use client";

import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { SleepSchedule } from "@/lib/types";
import { addMinutes, formatTime24, formatTime } from "@/lib/utils/time";

const DEFAULT_SLEEP: SleepSchedule = {
  bedtime: { hours: 23, minutes: 0 },
  wakeTime: { hours: 10, minutes: 30 },
  targetHours: 8,
};

interface RoutineItem {
  id: string;
  emoji: string;
  label: string;
  durationMinutes: number;
  offsetMinutes: number; // minutes after wake time
  category: "wake" | "hygiene" | "meal" | "exercise" | "commute" | "buffer";
  note?: string;
}

const BASE_ROUTINE: RoutineItem[] = [
  { id: "wake",       emoji: "🌅", label: "Wake up",                durationMinutes: 0,  offsetMinutes: 0,   category: "wake" },
  { id: "shower-am",  emoji: "🚿", label: "Cold body shower",        durationMinutes: 5,  offsetMinutes: 5,   category: "hygiene", note: "5 min cold" },
  { id: "mobility",   emoji: "🧘", label: "Dress / light mobility",  durationMinutes: 10, offsetMinutes: 10,  category: "buffer" },
  { id: "pre-meal",   emoji: "🍞", label: "Ham & cheese toast",      durationMinutes: 10, offsetMinutes: 20,  category: "meal", note: "Pre-workout fuel" },
  { id: "commute",    emoji: "🚶", label: "Digest / commute / warm-up", durationMinutes: 20, offsetMinutes: 40, category: "commute" },
  { id: "workout",    emoji: "🏋️", label: "Workout",                durationMinutes: 60, offsetMinutes: 60,  category: "exercise" },
  { id: "post-meal",  emoji: "🍳", label: "Scrambled eggs",          durationMinutes: 15, offsetMinutes: 135, category: "meal", note: "Post-workout protein" },
  { id: "buffer",     emoji: "📱", label: "Buffer / stretch / chill", durationMinutes: 80, offsetMinutes: 160, category: "buffer" },
  { id: "shower-pm",  emoji: "🚿", label: "Full shower → work prep", durationMinutes: 20, offsetMinutes: 240, category: "hygiene" },
];

const categoryColor: Record<RoutineItem["category"], string> = {
  wake:     "bg-amber-900/40 text-amber-400 border-amber-900",
  hygiene:  "bg-sky-900/40 text-sky-400 border-sky-900",
  meal:     "bg-emerald-900/40 text-emerald-400 border-emerald-900",
  exercise: "bg-indigo-900/40 text-indigo-400 border-indigo-900",
  commute:  "bg-zinc-800 text-zinc-400 border-zinc-700",
  buffer:   "bg-zinc-800 text-zinc-500 border-zinc-700",
};

const TODAY = new Date().toISOString().split("T")[0];

export default function RoutinePage() {
  const [sleep] = useLocalStorage<SleepSchedule>("sb-sleep", DEFAULT_SLEEP);
  const [completedMap, setCompletedMap] = useLocalStorage<Record<string, string[]>>(
    "sb-routine-completed",
    {}
  );
  const [editMode, setEditMode] = useState(false);

  const todayCompleted: string[] = completedMap[TODAY] ?? [];

  const toggle = (id: string) => {
    setCompletedMap((prev) => {
      const current = prev[TODAY] ?? [];
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...prev, [TODAY]: next };
    });
  };

  const resolvedItems = useMemo(
    () =>
      BASE_ROUTINE.map((item) => ({
        ...item,
        startTime: addMinutes(sleep.wakeTime, item.offsetMinutes),
        endTime:
          item.durationMinutes > 0
            ? addMinutes(sleep.wakeTime, item.offsetMinutes + item.durationMinutes)
            : null,
      })),
    [sleep.wakeTime]
  );

  const progress = todayCompleted.length;
  const total = BASE_ROUTINE.length;
  const pct = Math.round((progress / total) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header
        title="Morning Routine"
        subtitle={`Wake up at ${formatTime(sleep.wakeTime)}`}
        action={
          <button
            onClick={() => setEditMode((e) => !e)}
            className="text-xs text-zinc-400 border border-zinc-700 rounded-lg px-3 py-1.5 hover:text-zinc-200"
          >
            {editMode ? "Done" : "Reset"}
          </button>
        }
      />

      <main className="flex-1 px-4 py-5 pb-28 max-w-md mx-auto w-full space-y-5">
        {/* Progress bar */}
        <div className="rounded-2xl bg-surface-card border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-zinc-300">Today's Progress</p>
            <p className="text-sm font-semibold text-zinc-100">
              {progress}/{total}
            </p>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-1.5">{pct}% complete</p>
        </div>

        {/* Routine items */}
        <div className="space-y-2">
          {resolvedItems.map((item, idx) => {
            const done = todayCompleted.includes(item.id);
            const isActive =
              !done &&
              todayCompleted.length === idx;

            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={[
                  "w-full text-left rounded-2xl border p-4 flex items-start gap-3 transition-all",
                  done
                    ? "bg-zinc-900 border-zinc-800 opacity-60"
                    : isActive
                    ? "bg-surface-card border-brand/50 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]"
                    : "bg-surface-card border-zinc-800",
                ].join(" ")}
              >
                {/* Time column */}
                <div className="flex-shrink-0 w-[52px] text-right">
                  <p className={`text-xs font-mono font-semibold ${done ? "text-zinc-600" : "text-zinc-300"}`}>
                    {formatTime24(item.startTime)}
                  </p>
                  {item.endTime && (
                    <p className="text-xs font-mono text-zinc-600">
                      {formatTime24(item.endTime)}
                    </p>
                  )}
                </div>

                {/* Divider line */}
                <div className="flex flex-col items-center self-stretch gap-0.5 pt-1">
                  <div
                    className={[
                      "h-3 w-3 rounded-full border-2 flex-shrink-0",
                      done
                        ? "bg-brand border-brand"
                        : isActive
                        ? "bg-transparent border-brand"
                        : "bg-transparent border-zinc-700",
                    ].join(" ")}
                  />
                  {idx < resolvedItems.length - 1 && (
                    <div className="flex-1 w-px bg-zinc-800" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.emoji}</span>
                    <p
                      className={[
                        "text-sm font-medium",
                        done ? "line-through text-zinc-600" : "text-zinc-100",
                      ].join(" ")}
                    >
                      {item.label}
                    </p>
                  </div>
                  {item.note && (
                    <p className="text-xs text-zinc-500 mt-0.5 ml-6">{item.note}</p>
                  )}
                  {item.durationMinutes > 0 && (
                    <span
                      className={[
                        "inline-block mt-1.5 ml-6 rounded-full px-2 py-0.5 text-xs font-medium border",
                        categoryColor[item.category],
                      ].join(" ")}
                    >
                      {item.durationMinutes} min
                    </span>
                  )}
                </div>

                {/* Check indicator */}
                <div
                  className={[
                    "flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center",
                    done
                      ? "bg-brand border-brand"
                      : "border-zinc-700",
                  ].join(" ")}
                >
                  {done && (
                    <svg viewBox="0 0 12 10" fill="none" className="h-3 w-3">
                      <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Reset today */}
        {todayCompleted.length > 0 && (
          <button
            onClick={() => setCompletedMap((prev) => ({ ...prev, [TODAY]: [] }))}
            className="w-full text-xs text-zinc-600 hover:text-zinc-400 py-2 transition-colors"
          >
            Reset today's routine
          </button>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
