export interface UserProfile {
  name: string;
  avatarEmoji: string;
  bodyWeightKg: number;
  goalType: "cut" | "maintain" | "bulk";
  calorieGoal: number;
  typicalRole: string;
  workDays: number[]; // 0=Mon … 6=Sun
}

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  avatarEmoji: "💪",
  bodyWeightKg: 80,
  goalType: "maintain",
  calorieGoal: 2400,
  typicalRole: "Floor Lead",
  workDays: [0, 1, 2, 3, 4], // Mon–Fri
};

export function calcCalorieGoal(
  weightKg: number,
  goal: UserProfile["goalType"]
): number {
  const base = Math.round(weightKg * 30);
  if (goal === "cut") return Math.round(base * 0.82);
  if (goal === "bulk") return Math.round(base * 1.15);
  return base;
}
