import type { Time, SleepSchedule, Shift } from "@/lib/types";
import type { Workout } from "@/lib/types";
import { timeToMinutes, minutesToTime, addMinutes } from "./time";
import { meals } from "@/lib/data/meals";

export type EventCategory =
  | "wake"
  | "hygiene"
  | "meal"
  | "gym"
  | "shift"
  | "commute"
  | "recovery"
  | "prep"
  | "buffer"
  | "sleep";

export interface PlanEvent {
  id: string;
  startTime: Time;
  endTime?: Time;
  label: string;
  emoji: string;
  category: EventCategory;
  detail?: string;
  mealId?: string;
  calories?: number;
}

export interface DayInsight {
  emoji: string;
  message: string;
  type: "positive" | "warning" | "info";
}

export interface DayPlanResult {
  events: PlanEvent[];
  insights: DayInsight[];
  totalCalories: number;
  gymLocation: "pre-shift" | "post-shift" | "free" | "none";
}

// ─── helpers ────────────────────────────────────────────────────────────────

function mins(t: Time, wake: Time): number {
  // Returns minutes since wake time, handling next-day wrap
  const diff = timeToMinutes(t) - timeToMinutes(wake);
  return diff < -120 ? diff + 1440 : diff;
}

function sortByWake(events: PlanEvent[], wake: Time): PlanEvent[] {
  return [...events].sort((a, b) => mins(a.startTime, wake) - mins(b.startTime, wake));
}

// ─── main planner ────────────────────────────────────────────────────────────

export function buildDayPlan(
  sleep: SleepSchedule,
  shift: Shift | null,
  workout: Workout | null
): DayPlanResult {
  const events: PlanEvent[] = [];
  const insights: DayInsight[] = [];
  let totalCalories = 0;

  const wake = sleep.wakeTime;
  const bed = sleep.bedtime;
  const wakeMin = timeToMinutes(wake);
  const bedMin = timeToMinutes(bed) < wakeMin - 120
    ? timeToMinutes(bed) + 1440
    : timeToMinutes(bed);

  const isRestDay = !workout || workout.type === "rest";
  const workoutDur = workout?.durationMinutes ?? 0;

  // ── 1. Morning routine ──────────────────────────────────────────────────
  events.push({ id: "wake", startTime: wake, label: "Wake up", emoji: "🌅", category: "wake" });

  events.push({
    id: "shower-am",
    startTime: addMinutes(wake, 5),
    endTime: addMinutes(wake, 10),
    label: "Cold shower",
    emoji: "🚿",
    category: "hygiene",
    detail: "5 min cold exposure",
  });

  events.push({
    id: "mobility",
    startTime: addMinutes(wake, 10),
    endTime: addMinutes(wake, 20),
    label: "Dress + light mobility",
    emoji: "🧘",
    category: "prep",
  });

  // ── 2. Decide gym slot ──────────────────────────────────────────────────
  const shiftStartMin = shift ? timeToMinutes(shift.startTime) : null;
  const shiftEndMin = shift
    ? (timeToMinutes(shift.endTime) <= wakeMin - 60
        ? timeToMinutes(shift.endTime) + 1440
        : timeToMinutes(shift.endTime))
    : null;

  let gymLocation: DayPlanResult["gymLocation"] = "none";
  let gymStartMin = 0;

  if (!isRestDay) {
    const preferred = wakeMin + 90;

    if (shiftStartMin !== null && shiftEndMin !== null) {
      const adjShiftStart = shiftStartMin <= wakeMin - 60
        ? shiftStartMin + 1440
        : shiftStartMin;

      const gymEndIfPre = preferred + workoutDur;

      if (gymEndIfPre + 90 <= adjShiftStart) {
        gymStartMin = preferred;
        gymLocation = "pre-shift";
      } else {
        const postGym = shiftEndMin + 45;
        if (postGym + workoutDur + 90 <= bedMin) {
          gymStartMin = postGym;
          gymLocation = "post-shift";
        }
        // else no gym today
      }
    } else {
      gymStartMin = preferred;
      gymLocation = "free";
    }
  }

  // ── 3. Pre-shift / free gym block ───────────────────────────────────────
  if (gymLocation === "pre-shift" || gymLocation === "free") {
    const preM = meals.find((m) => m.type === "pre-workout")!;
    const mealMin = gymStartMin - 70;

    if (mealMin >= wakeMin + 15) {
      events.push({
        id: "pre-meal",
        startTime: minutesToTime(mealMin),
        label: preM.name,
        emoji: preM.emoji,
        category: "meal",
        detail: `${preM.calories} kcal · Pre-workout fuel`,
        mealId: preM.id,
        calories: preM.calories,
      });
      totalCalories += preM.calories;
    }

    events.push({
      id: "commute",
      startTime: minutesToTime(gymStartMin - 20),
      label: "Commute + warm-up",
      emoji: "🚶",
      category: "commute",
    });

    const gymEnd = minutesToTime(gymStartMin + workoutDur);
    events.push({
      id: "gym",
      startTime: minutesToTime(gymStartMin),
      endTime: gymEnd,
      label: workout!.name,
      emoji: "🏋️",
      category: "gym",
      detail: `${workout!.muscles.join(" · ")} · ${workoutDur} min`,
    });

    const postM = meals.find((m) => m.type === "post-workout")!;
    const postMealTime = addMinutes(gymEnd, 15);
    events.push({
      id: "post-meal",
      startTime: postMealTime,
      label: postM.name,
      emoji: postM.emoji,
      category: "meal",
      detail: `${postM.calories} kcal · Post-workout recovery`,
      mealId: postM.id,
      calories: postM.calories,
    });
    totalCalories += postM.calories;

    if (shift && gymLocation === "pre-shift") {
      const adjShiftStart = shiftStartMin! <= wakeMin - 60
        ? shiftStartMin! + 1440
        : shiftStartMin!;
      const prepMin = adjShiftStart - 30;
      const postMealMin = timeToMinutes(postMealTime);

      if (prepMin > postMealMin + 10) {
        events.push({
          id: "buffer",
          startTime: minutesToTime(postMealMin + 5),
          endTime: minutesToTime(prepMin),
          label: "Buffer / stretch / chill",
          emoji: "📱",
          category: "buffer",
          detail: "Digest, stretch, decompress",
        });
      }

      events.push({
        id: "shift-prep",
        startTime: minutesToTime(prepMin),
        endTime: shift.startTime,
        label: "Shower + prep for work",
        emoji: "🚿",
        category: "hygiene",
      });
    }
  } else if (!isRestDay) {
    // No gym today (no slot) — note a light breakfast
    const preM = meals.find((m) => m.type === "pre-workout")!;
    events.push({
      id: "breakfast",
      startTime: addMinutes(wake, 20),
      label: "Breakfast",
      emoji: "🍳",
      category: "meal",
      detail: "Rest or work-only day — keep nutrition balanced",
    });
  } else {
    events.push({
      id: "breakfast",
      startTime: addMinutes(wake, 20),
      label: "Breakfast",
      emoji: "🍳",
      category: "meal",
      detail: "Rest day — focus on protein + hydration",
    });
  }

  // ── 4. Shift block ──────────────────────────────────────────────────────
  if (shift) {
    const adjShiftStart = shiftStartMin! <= wakeMin - 60
      ? shiftStartMin! + 1440
      : shiftStartMin!;
    const duration = shiftEndMin! - adjShiftStart;
    const midMin = adjShiftStart + Math.floor(duration / 2);

    events.push({
      id: "shift",
      startTime: shift.startTime,
      endTime: shift.endTime,
      label: `${shift.role} @ ${shift.location}`,
      emoji: "💼",
      category: "shift",
      detail: `${shift.status} shift`,
    });

    const lunchM = meals.find((m) => m.type === "lunch")!;
    events.push({
      id: "work-lunch",
      startTime: minutesToTime(midMin),
      label: lunchM.name,
      emoji: lunchM.emoji,
      category: "meal",
      detail: `${lunchM.calories} kcal · Mid-shift meal`,
      mealId: lunchM.id,
      calories: lunchM.calories,
    });
    totalCalories += lunchM.calories;

    // ── 5. Post-shift gym ─────────────────────────────────────────────────
    if (gymLocation === "post-shift") {
      const preM = meals.find((m) => m.type === "pre-workout")!;
      const preGymMealMin = gymStartMin - 60;

      events.push({
        id: "post-shift-recovery",
        startTime: shift.endTime,
        endTime: minutesToTime(preGymMealMin),
        label: "Post-shift recovery",
        emoji: "💧",
        category: "recovery",
        detail: "Hydrate, light stretch, change",
      });

      events.push({
        id: "pre-meal-post",
        startTime: minutesToTime(preGymMealMin),
        label: preM.name,
        emoji: preM.emoji,
        category: "meal",
        detail: `${preM.calories} kcal · Pre-workout fuel`,
        mealId: preM.id,
        calories: preM.calories,
      });
      totalCalories += preM.calories;

      const gymEnd = minutesToTime(gymStartMin + workoutDur);
      events.push({
        id: "gym",
        startTime: minutesToTime(gymStartMin),
        endTime: gymEnd,
        label: workout!.name,
        emoji: "🏋️",
        category: "gym",
        detail: `${workout!.muscles.join(" · ")} · ${workoutDur} min`,
      });

      const postM = meals.find((m) => m.type === "post-workout")!;
      events.push({
        id: "post-meal",
        startTime: addMinutes(gymEnd, 15),
        label: postM.name,
        emoji: postM.emoji,
        category: "meal",
        detail: `${postM.calories} kcal · Post-workout recovery`,
        mealId: postM.id,
        calories: postM.calories,
      });
      totalCalories += postM.calories;
    }

    // Dinner after shift (or after post-shift gym)
    const dinnerBase =
      gymLocation === "post-shift"
        ? gymStartMin + workoutDur + 60
        : shiftEndMin! + 60;

    const dinnerM = meals.find((m) => m.type === "dinner")!;
    if (dinnerBase + 30 < bedMin) {
      events.push({
        id: "dinner",
        startTime: minutesToTime(dinnerBase),
        label: dinnerM.name,
        emoji: dinnerM.emoji,
        category: "meal",
        detail: `${dinnerM.calories} kcal · Recovery dinner`,
        mealId: dinnerM.id,
        calories: dinnerM.calories,
      });
      totalCalories += dinnerM.calories;
    }
  } else {
    // No shift → dinner 3h before bed
    const dinnerM = meals.find((m) => m.type === "dinner")!;
    const dinnerMin = bedMin - 180;
    if (dinnerMin > wakeMin + 120) {
      events.push({
        id: "dinner",
        startTime: minutesToTime(dinnerMin),
        label: dinnerM.name,
        emoji: dinnerM.emoji,
        category: "meal",
        detail: `${dinnerM.calories} kcal · Evening meal`,
        mealId: dinnerM.id,
        calories: dinnerM.calories,
      });
      totalCalories += dinnerM.calories;
    }
  }

  // ── 6. Wind-down + bed ──────────────────────────────────────────────────
  events.push({
    id: "wind-down",
    startTime: minutesToTime(bedMin - 60),
    label: "Wind down",
    emoji: "📵",
    category: "recovery",
    detail: "Screens off · light stretch · prepare for sleep",
  });

  events.push({
    id: "bedtime",
    startTime: bed,
    label: "Bedtime",
    emoji: "🌙",
    category: "sleep",
    detail: `Target: ${sleep.targetHours}h sleep`,
  });

  // ── 7. Insights ──────────────────────────────────────────────────────────
  if (gymLocation === "pre-shift" && shift) {
    insights.push({
      emoji: "💪",
      message: `Your shift doesn't start until ${formatT(shift.startTime)} — enough time for a full ${workout!.name} session first.`,
      type: "positive",
    });
  } else if (gymLocation === "post-shift" && shift) {
    insights.push({
      emoji: "🔄",
      message: `Shift runs ${formatT(shift.startTime)}–${formatT(shift.endTime)}. Gym slotted after at ${formatT(minutesToTime(gymStartMin))} — keep intensity ${workout!.intensity}.`,
      type: "info",
    });
  } else if (gymLocation === "free") {
    insights.push({
      emoji: "🎯",
      message: `Day off work — ideal for a full ${workout!.name}. Hit the gym at ${formatT(minutesToTime(gymStartMin))}.`,
      type: "positive",
    });
  } else if (isRestDay) {
    insights.push({
      emoji: "😴",
      message: "Rest day. Prioritise sleep quality, hydration, and hitting your protein target.",
      type: "info",
    });
  } else {
    insights.push({
      emoji: "⚠️",
      message: "No gym window found today given your shift and bedtime. Focus on nutrition and recovery.",
      type: "warning",
    });
  }

  const sleepMins = (bedMin - wakeMin + 1440) % 1440;
  if (sleepMins < sleep.targetHours * 60 - 30) {
    insights.push({
      emoji: "🌙",
      message: `You're tracking ${Math.floor(sleepMins / 60)}h sleep — ${Math.round(sleep.targetHours - sleepMins / 60 * 10) / 10}h short of your target. Consider an earlier bedtime.`,
      type: "warning",
    });
  } else {
    insights.push({
      emoji: "✅",
      message: `On track for ${Math.floor(sleepMins / 60)}h sleep — matching your ${sleep.targetHours}h target.`,
      type: "positive",
    });
  }

  if (totalCalories < 1800) {
    insights.push({
      emoji: "🍽️",
      message: `Planned calories: ${totalCalories} kcal. Add snacks to hit your daily goal.`,
      type: "warning",
    });
  }

  return { events: sortByWake(events, wake), insights, totalCalories, gymLocation };
}

function formatT(t: Time): string {
  const h = t.hours % 12 || 12;
  const period = t.hours >= 12 ? "PM" : "AM";
  return `${h}:${String(t.minutes).padStart(2, "0")} ${period}`;
}
