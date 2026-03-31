export interface UserProfile {
  name: string;
  avatarEmoji: string;
  photoUrl?: string;
  age?: number;
  gender?: "male" | "female" | "non-binary" | "prefer-not";
  bodyWeightKg: number;
  goalType: "cut" | "maintain" | "bulk";
  calorieGoal: number;
  typicalRole: string;
  workDays: number[]; // 0=Mon … 6=Sun
  activityLevel?: "low" | "moderate" | "high";
  trainingDaysPerWeek?: number;
  rotatingSchedule?: boolean;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  avatarEmoji: "💪",
  photoUrl: undefined,
  age: undefined,
  gender: undefined,
  bodyWeightKg: 80,
  goalType: "maintain",
  calorieGoal: 2400,
  typicalRole: "Floor Lead",
  workDays: [0, 1, 2, 3, 4],
  activityLevel: "moderate",
  trainingDaysPerWeek: 4,
  rotatingSchedule: false,
};

export function calcCalorieGoal(
  weightKg: number,
  goal: UserProfile["goalType"],
  activityLevel: "low" | "moderate" | "high" = "moderate"
): number {
  const activityMult = { low: 1.0, moderate: 1.1, high: 1.25 }[activityLevel];
  const base = Math.round(weightKg * 30 * activityMult);
  if (goal === "cut")  return Math.round(base * 0.82);
  if (goal === "bulk") return Math.round(base * 1.15);
  return base;
}
