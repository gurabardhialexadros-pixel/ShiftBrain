export interface Time {
  hours: number;
  minutes: number;
}

export interface SleepSchedule {
  bedtime: Time;
  wakeTime: Time;
  targetHours: number;
}

export interface Shift {
  id: string;
  date: string;
  startTime: Time;
  endTime: Time;
  role: string;
  location: string;
  status: "confirmed" | "pending" | "open";
}

export interface RoutineTask {
  id: string;
  label: string;
  offsetMinutes: number;
  durationMinutes: number;
  emoji?: string;
  category: "wake" | "hygiene" | "meal" | "exercise" | "commute" | "work" | "buffer";
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type: "pre-workout" | "post-workout" | "lunch" | "dinner" | "snack";
  timing: string;
  emoji: string;
  description: string;
}

export interface Workout {
  id: string;
  name: string;
  type: "push" | "pull" | "legs" | "cardio" | "active-recovery" | "rest";
  muscles: string[];
  intensity: "low" | "moderate" | "high";
  durationMinutes: number;
  exercises: Exercise[];
  color: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

export interface DayPlan {
  date: string;
  workout: Workout | null;
  gymTime: Time | null;
  preWorkoutMeal: Meal | null;
  postWorkoutMeal: Meal | null;
  shiftStart: Time | null;
  recommendation: string;
}
