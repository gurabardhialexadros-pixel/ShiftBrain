import type { Workout } from "@/lib/types";

export const weeklyPlan: Workout[] = [
  {
    id: "push",
    name: "Push Day",
    type: "push",
    muscles: ["Chest", "Shoulders", "Triceps"],
    intensity: "high",
    durationMinutes: 60,
    color: "#6366f1",
    exercises: [
      { name: "Flat Bench Press", sets: 4, reps: "6–8", rest: "2 min" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "8–10", rest: "90 s" },
      { name: "Cable Fly", sets: 3, reps: "12–15", rest: "60 s" },
      { name: "Overhead Press", sets: 3, reps: "8–10", rest: "90 s" },
      { name: "Lateral Raises", sets: 4, reps: "15–20", rest: "45 s" },
      { name: "Tricep Pushdown", sets: 3, reps: "12–15", rest: "60 s" },
      { name: "Overhead Tricep Extension", sets: 3, reps: "12–15", rest: "60 s" },
    ],
  },
  {
    id: "pull",
    name: "Pull Day",
    type: "pull",
    muscles: ["Back", "Biceps", "Rear Delts"],
    intensity: "high",
    durationMinutes: 65,
    color: "#8b5cf6",
    exercises: [
      { name: "Deadlift", sets: 4, reps: "4–6", rest: "3 min" },
      { name: "Pull-ups / Lat Pulldown", sets: 4, reps: "6–10", rest: "90 s" },
      { name: "Seated Cable Row", sets: 3, reps: "10–12", rest: "90 s" },
      { name: "Face Pulls", sets: 3, reps: "15–20", rest: "60 s" },
      { name: "Barbell Curl", sets: 3, reps: "10–12", rest: "60 s" },
      { name: "Hammer Curl", sets: 3, reps: "12–15", rest: "60 s" },
    ],
  },
  {
    id: "legs",
    name: "Leg Day",
    type: "legs",
    muscles: ["Quads", "Hamstrings", "Glutes", "Calves"],
    intensity: "high",
    durationMinutes: 70,
    color: "#ec4899",
    exercises: [
      { name: "Squat", sets: 4, reps: "6–8", rest: "2–3 min" },
      { name: "Romanian Deadlift", sets: 3, reps: "8–10", rest: "2 min" },
      { name: "Leg Press", sets: 3, reps: "10–12", rest: "90 s" },
      { name: "Leg Curl", sets: 3, reps: "12–15", rest: "60 s" },
      { name: "Leg Extension", sets: 3, reps: "12–15", rest: "60 s" },
      { name: "Hip Thrust", sets: 3, reps: "10–12", rest: "90 s" },
      { name: "Calf Raises", sets: 4, reps: "15–20", rest: "45 s" },
    ],
  },
  {
    id: "active-recovery",
    name: "Active Recovery",
    type: "active-recovery",
    muscles: ["Full Body"],
    intensity: "low",
    durationMinutes: 40,
    color: "#10b981",
    exercises: [
      { name: "Light Walk / Cycling", sets: 1, reps: "20 min", rest: "—" },
      { name: "Hip Flexor Stretch", sets: 2, reps: "60 s each side", rest: "—" },
      { name: "Thoracic Rotation", sets: 2, reps: "10 each side", rest: "—" },
      { name: "Foam Rolling", sets: 1, reps: "10–15 min", rest: "—" },
    ],
  },
  {
    id: "push-vol",
    name: "Push (Volume)",
    type: "push",
    muscles: ["Chest", "Shoulders", "Triceps"],
    intensity: "moderate",
    durationMinutes: 55,
    color: "#6366f1",
    exercises: [
      { name: "Incline Bench Press", sets: 4, reps: "10–12", rest: "90 s" },
      { name: "Dumbbell Fly", sets: 3, reps: "12–15", rest: "60 s" },
      { name: "Push-ups", sets: 3, reps: "15–20", rest: "60 s" },
      { name: "Arnold Press", sets: 3, reps: "10–12", rest: "90 s" },
      { name: "Cable Lateral Raise", sets: 3, reps: "15–20", rest: "45 s" },
      { name: "Skull Crushers", sets: 3, reps: "12–15", rest: "60 s" },
    ],
  },
  {
    id: "pull-vol",
    name: "Pull (Volume)",
    type: "pull",
    muscles: ["Back", "Biceps"],
    intensity: "moderate",
    durationMinutes: 55,
    color: "#8b5cf6",
    exercises: [
      { name: "Cable Row", sets: 4, reps: "12–15", rest: "75 s" },
      { name: "Single-Arm Row", sets: 3, reps: "12 each", rest: "60 s" },
      { name: "Straight-Arm Pulldown", sets: 3, reps: "15–20", rest: "60 s" },
      { name: "Reverse Fly", sets: 3, reps: "15–20", rest: "45 s" },
      { name: "Concentration Curl", sets: 3, reps: "12–15", rest: "60 s" },
    ],
  },
  {
    id: "rest",
    name: "Rest Day",
    type: "rest",
    muscles: [],
    intensity: "low",
    durationMinutes: 0,
    color: "#52525b",
    exercises: [],
  },
];

// Default 7-day rotation: Push, Pull, Legs, Rest, Push Vol, Pull Vol, Rest
export const defaultWeekRotation = [
  "push",
  "pull",
  "legs",
  "active-recovery",
  "push-vol",
  "pull-vol",
  "rest",
];

export const getWorkoutById = (id: string) =>
  weeklyPlan.find((w) => w.id === id) ?? weeklyPlan[6];

export const intensityLabel: Record<string, string> = {
  high: "High Intensity",
  moderate: "Moderate",
  low: "Low / Recovery",
};

export const intensityColor: Record<string, string> = {
  high: "text-red-400",
  moderate: "text-amber-400",
  low: "text-emerald-400",
};
