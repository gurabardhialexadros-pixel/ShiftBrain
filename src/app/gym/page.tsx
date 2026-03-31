"use client";

import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { weeklyPlan, defaultWeekRotation, getWorkoutById, intensityLabel, intensityColor } from "@/lib/data/workouts";
import type { SleepSchedule, Shift } from "@/lib/types";
import { addMinutes, formatTime, formatTime24 } from "@/lib/utils/time";

const DEFAULT_SLEEP: SleepSchedule = {
  bedtime: { hours: 23, minutes: 0 },
  wakeTime: { hours: 10, minutes: 30 },
  targetHours: 8,
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY_IDX = new Date().getDay(); // 0 = Sun
// Shift so Monday = 0
const todayOffset = TODAY_IDX === 0 ? 6 : TODAY_IDX - 1;

const typeIcon: Record<string, string> = {
  push:             "⬆️",
  pull:             "⬇️",
  legs:             "🦵",
  cardio:           "🏃",
  "active-recovery":"🧘",
  rest:             "😴",
};

export default function GymPage() {
  const [sleep] = useLocalStorage<SleepSchedule>("sb-sleep", DEFAULT_SLEEP);
  const [shifts] = useLocalStorage<Shift[]>("sb-shifts", []);

  // Find today's shift if any
  const todayDate = new Date().toISOString().split("T")[0];
  const todayShift = shifts.find((s) => s.date === todayDate) ?? null;

  // If shift starts within 3h of preferred gym time, push gym after shift
  const preferredGym = addMinutes(sleep.wakeTime, 90);
  const recommendedGymTime = (() => {
    if (!todayShift) return preferredGym;
    const shiftStartMin = todayShift.startTime.hours * 60 + todayShift.startTime.minutes;
    const preferredMin = preferredGym.hours * 60 + preferredGym.minutes;
    // If shift starts within 2.5h of preferred gym time, gym after shift
    if (Math.abs(shiftStartMin - preferredMin) < 150) {
      return addMinutes(todayShift.endTime, 45);
    }
    return preferredGym;
  })();

  const week = defaultWeekRotation.map((id, i) => ({
    day: DAYS[i],
    isToday: i === todayOffset,
    workout: getWorkoutById(id),
  }));

  const todayWorkout = week[todayOffset].workout;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header
        title="Gym Schedule"
        subtitle="Based on your sleep & shift plan"
      />

      <main className="flex-1 px-4 py-5 pb-36 max-w-md mx-auto w-full flex flex-col gap-[14px]">
        {/* Today's recommendation */}
        <div
          className="rounded-2xl border p-5 space-y-3"
          style={{ borderColor: `${todayWorkout.color}40`, background: `${todayWorkout.color}10` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Today's Session</p>
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <span>{typeIcon[todayWorkout.type]}</span>
                {todayWorkout.name}
              </h2>
            </div>
            {todayWorkout.type !== "rest" && (
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-zinc-500">Recommended time</p>
                <p className="text-sm font-semibold text-zinc-100 mt-0.5">
                  {formatTime(recommendedGymTime)}
                </p>
              </div>
            )}
          </div>

          {todayWorkout.type !== "rest" && (
            <>
              <div className="flex flex-wrap gap-2">
                {todayWorkout.muscles.map((m) => (
                  <span
                    key={m}
                    className="rounded-full px-2.5 py-1 text-xs font-medium border"
                    style={{ borderColor: `${todayWorkout.color}50`, color: todayWorkout.color }}
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className={`font-semibold ${intensityColor[todayWorkout.intensity]}`}>
                  {intensityLabel[todayWorkout.intensity]}
                </span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-400">{todayWorkout.durationMinutes} min</span>
              </div>
            </>
          )}
          {todayWorkout.type === "rest" && (
            <p className="text-sm text-zinc-500">Full rest day. Focus on sleep, hydration, and nutrition.</p>
          )}
          {todayShift && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1 border-t border-zinc-800/60">
              <span>🗓</span>
              <span>Shift today: {formatTime24(todayShift.startTime)} – {formatTime24(todayShift.endTime)} · {todayShift.location}</span>
            </div>
          )}
        </div>

        {/* 7-day overview strip */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">This Week</h2>
          <div className="flex gap-1.5">
            {week.map(({ day, isToday, workout }) => (
              <div
                key={day}
                className={[
                  "flex-1 flex flex-col items-center gap-1.5 rounded-xl py-2.5 border transition-colors",
                  isToday ? "border-accent/40" : "border-white/[0.07]",
                ].join(" ")}
                style={isToday ? {
                  background: "linear-gradient(160deg, rgba(55,58,48,0.88) 0%, rgba(28,30,22,0.94) 55%, rgba(18,18,20,1) 100%)",
                } : {
                  background: "linear-gradient(160deg, rgba(50,50,53,0.88) 0%, rgba(28,28,30,0.94) 55%, rgba(18,18,20,1) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <p className={`text-[10px] font-semibold ${isToday ? "text-accent" : "text-zinc-500"}`}>
                  {day}
                </p>
                <span className="text-base">{typeIcon[workout.type]}</span>
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      workout.type === "rest" ? "#52525b" : workout.color,
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Today's exercise list */}
        {todayWorkout.exercises.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Exercise List</h2>
            <div className="glass-card overflow-hidden divide-y divide-zinc-800/50">
              {todayWorkout.exercises.map((ex, i) => (
                <div key={ex.name} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs text-zinc-600 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100">{ex.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-zinc-300">
                      {ex.sets} × {ex.reps}
                    </p>
                    <p className="text-xs text-zinc-600">{ex.rest}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full weekly detail */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Full Week Plan</h2>
          <div className="space-y-2">
            {week.map(({ day, isToday, workout }) => (
              <div
                key={day}
                className={[
                  "rounded-2xl border p-4 flex items-center gap-4",
                  isToday ? "border-accent/40" : "border-white/[0.07]",
                ].join(" ")}
                style={isToday ? {
                  background: "linear-gradient(160deg, rgba(55,58,48,0.88) 0%, rgba(28,30,22,0.94) 55%, rgba(18,18,20,1) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(163,230,53,0.07), 0 4px 20px rgba(0,0,0,0.4)",
                } : {
                  background: "linear-gradient(160deg, rgba(50,50,53,0.88) 0%, rgba(28,28,30,0.94) 55%, rgba(18,18,20,1) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{
                    background: `${workout.color}20`,
                  }}
                >
                  {typeIcon[workout.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${isToday ? "text-zinc-100" : "text-zinc-300"}`}>
                      {workout.name}
                    </p>
                    {isToday && (
                      <span className="text-[10px] font-semibold text-accent bg-accent/15 rounded-full px-2 py-0.5">
                        Today
                      </span>
                    )}
                  </div>
                  {workout.muscles.length > 0 && (
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      {workout.muscles.join(" · ")}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-semibold ${intensityColor[workout.intensity]}`}>
                    {workout.durationMinutes > 0 ? `${workout.durationMinutes}m` : "—"}
                  </p>
                  <p className="text-xs text-zinc-600">{day}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
