import type { Time, SleepSchedule, Shift, DayPlan } from "@/lib/types";
import { timeToMinutes, addMinutes } from "./time";
import { meals } from "@/lib/data/meals";
import { weeklyPlan, defaultWeekRotation, getWorkoutById } from "@/lib/data/workouts";

// Returns a recommended gym time given wake time and optional shift start.
// Rule: aim for 60-90 min after wake, but at least 2h before shift start.
function recommendGymTime(
  wakeTime: Time,
  shiftStart: Time | null
): { gymTime: Time; recommendation: string } {
  const wakeMin = timeToMinutes(wakeTime);
  const preferredGym = wakeMin + 90; // 90 min after wake (digest + commute)

  if (!shiftStart) {
    return {
      gymTime: { hours: Math.floor(preferredGym / 60) % 24, minutes: preferredGym % 60 },
      recommendation: "Rest day — great time for a full workout session.",
    };
  }

  const shiftMin = timeToMinutes(shiftStart);
  const latestGymStart = shiftMin - 120; // gym must end 2h before shift

  if (preferredGym + 70 <= latestGymStart) {
    return {
      gymTime: { hours: Math.floor(preferredGym / 60) % 24, minutes: preferredGym % 60 },
      recommendation: "Train before your shift. You'll have time to recover.",
    };
  }

  // Gym after shift
  const postShift = shiftMin + 8 * 60 + 30; // assume 8h shift + 30 min buffer
  return {
    gymTime: { hours: Math.floor(postShift / 60) % 24, minutes: postShift % 60 },
    recommendation: "Shift first, gym after. Keep intensity moderate — you'll be on your feet.",
  };
}

export function buildWeekPlan(
  shifts: Shift[],
  sleep: SleepSchedule,
  startDayOffset = 0 // 0 = today is day index 0
): DayPlan[] {
  return Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (startDayOffset + i) % 7;
    const workout = getWorkoutById(defaultWeekRotation[dayIndex]);

    const shift = shifts[i] ?? null;
    const shiftStart = shift ? shift.startTime : null;

    const { gymTime, recommendation } = recommendGymTime(sleep.wakeTime, shiftStart);

    const preWorkout = meals.find((m) => m.type === "pre-workout") ?? null;
    const postWorkout = meals.find((m) => m.type === "post-workout") ?? null;

    return {
      date: new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
      workout: workout.type === "rest" ? null : workout,
      gymTime: workout.type === "rest" ? null : gymTime,
      preWorkoutMeal: workout.type === "rest" ? null : preWorkout,
      postWorkoutMeal: workout.type === "rest" ? null : postWorkout,
      shiftStart,
      recommendation,
    };
  });
}

export function getDailyCalorieTarget(
  bodyWeightKg: number,
  goalType: "cut" | "maintain" | "bulk"
): number {
  const base = bodyWeightKg * 30; // rough TDEE
  if (goalType === "cut") return Math.round(base * 0.8);
  if (goalType === "bulk") return Math.round(base * 1.15);
  return Math.round(base);
}
