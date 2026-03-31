"use client";

import { useCallback } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import SleepWheel from "@/components/sleep/SleepWheel";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { SleepSchedule, Time } from "@/lib/types";
import { sleepDuration, formatDuration } from "@/lib/utils/time";

const DEFAULT_SLEEP: SleepSchedule = {
  bedtime: { hours: 23, minutes: 0 },
  wakeTime: { hours: 7, minutes: 0 },
  targetHours: 8,
};

const TARGET_OPTIONS = [6, 7, 7.5, 8, 8.5, 9];

export default function SleepPage() {
  const [schedule, setSchedule, hydrated] = useLocalStorage<SleepSchedule>(
    "sb-sleep",
    DEFAULT_SLEEP
  );

  const handleChange = useCallback(
    (type: "bed" | "wake", time: Time) => {
      setSchedule((prev) => ({
        ...prev,
        bedtime: type === "bed" ? time : prev.bedtime,
        wakeTime: type === "wake" ? time : prev.wakeTime,
      }));
    },
    [setSchedule]
  );

  const handleBothChange = useCallback(
    (bed: Time, wake: Time) => {
      setSchedule((prev) => ({ ...prev, bedtime: bed, wakeTime: wake }));
    },
    [setSchedule]
  );

  const actualMins = sleepDuration(schedule.bedtime, schedule.wakeTime);
  const targetMins = schedule.targetHours * 60;
  const diff = actualMins - targetMins;
  const diffLabel =
    diff === 0
      ? "On target"
      : diff > 0
      ? `+${formatDuration(diff)} over target`
      : `${formatDuration(Math.abs(diff))} under target`;
  const diffColor =
    diff === 0 ? "text-emerald-400" : diff > 0 ? "text-sky-400" : "text-amber-400";

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header title="Sleep Schedule" subtitle="Drag to adjust your sleep window" />

      <main className="flex-1 px-4 py-6 pb-36 max-w-md mx-auto w-full space-y-6">
        {/* Wheel */}
        <SleepWheel
          bedtime={schedule.bedtime}
          wakeTime={schedule.wakeTime}
          onChange={handleChange}
          onBothChange={handleBothChange}
        />

        {/* Status bar */}
        <div className="rounded-2xl bg-surface-card border border-zinc-800 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500">Actual sleep</p>
            <p className="text-2xl font-bold text-zinc-100 mt-0.5">
              {formatDuration(actualMins)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">vs target</p>
            <p className={`text-sm font-semibold mt-0.5 ${diffColor}`}>{diffLabel}</p>
          </div>
        </div>

        {/* Target sleep selector */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">
            Target Sleep Duration
          </h2>
          <div className="flex gap-2 flex-wrap">
            {TARGET_OPTIONS.map((h) => {
              const label = h % 1 === 0 ? `${h}h` : `${h}h`;
              const active = schedule.targetHours === h;
              return (
                <button
                  key={h}
                  onClick={() => setSchedule((p) => ({ ...p, targetHours: h }))}
                  className={[
                    "flex-1 min-w-[60px] rounded-xl py-2 text-sm font-medium border transition-colors",
                    active
                      ? "bg-brand text-white border-brand"
                      : "bg-surface-card text-zinc-400 border-zinc-800 hover:text-zinc-200",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Sleep quality tips */}
        <section className="rounded-2xl bg-surface-card border border-zinc-800 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300">Sleep Tips for Shift Workers</h2>
          {[
            { emoji: "🌡️", tip: "Keep your room cool (16–18 °C) for deeper sleep." },
            { emoji: "📵", tip: "No screens 30 min before bedtime — use night shift mode." },
            { emoji: "☕", tip: "Cut caffeine 6 hours before your target bedtime." },
            { emoji: "🪟", tip: "Use blackout curtains if sleeping during the day." },
          ].map(({ emoji, tip }) => (
            <div key={tip} className="flex gap-3 items-start">
              <span className="text-base">{emoji}</span>
              <p className="text-xs text-zinc-500 leading-relaxed">{tip}</p>
            </div>
          ))}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
