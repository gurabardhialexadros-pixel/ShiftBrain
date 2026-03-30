"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Button from "@/components/ui/Button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { type UserProfile, DEFAULT_PROFILE, calcCalorieGoal } from "@/lib/profile";

const AVATARS = ["💪", "🧠", "🔥", "⚡", "🎯", "🦁", "🐺", "🚀"];
const ROLES   = ["Floor Lead", "Cashier", "Supervisor", "Stocking", "Manager", "Other"];
const DAYS    = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const GOALS: { key: UserProfile["goalType"]; label: string; desc: string; emoji: string; color: string }[] = [
  { key: "cut",      label: "Lose Fat",     desc: "~18% deficit",   emoji: "🔥", color: "border-orange-700/50 bg-orange-900/20" },
  { key: "maintain", label: "Stay Lean",    desc: "Maintenance",    emoji: "⚖️", color: "border-sky-700/50 bg-sky-900/20" },
  { key: "bulk",     label: "Build Muscle", desc: "~15% surplus",   emoji: "💪", color: "border-violet-700/50 bg-violet-900/20" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile, hydrated] = useLocalStorage<UserProfile>("sb-profile", DEFAULT_PROFILE);

  const [name,     setName]     = useState(profile.name);
  const [avatar,   setAvatar]   = useState(profile.avatarEmoji);
  const [weight,   setWeight]   = useState(profile.bodyWeightKg);
  const [goal,     setGoal]     = useState<UserProfile["goalType"]>(profile.goalType);
  const [override, setOverride] = useState<number | null>(null); // manual kcal override
  const [role,     setRole]     = useState(profile.typicalRole);
  const [workDays, setWorkDays] = useState<number[]>(profile.workDays);

  // Sync state once hydrated
  useEffect(() => {
    if (hydrated) {
      setName(profile.name);
      setAvatar(profile.avatarEmoji);
      setWeight(profile.bodyWeightKg);
      setGoal(profile.goalType);
      setRole(profile.typicalRole);
      setWorkDays(profile.workDays);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const autoCalorie = calcCalorieGoal(weight, goal);
  const calorieGoal = override ?? autoCalorie;

  const toggleDay = (i: number) =>
    setWorkDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]
    );

  const save = () => {
    setProfile({
      name: name.trim(),
      avatarEmoji: avatar,
      bodyWeightKg: weight,
      goalType: goal,
      calorieGoal,
      typicalRole: role,
      workDays,
    });
    router.back();
  };

  const resetOnboarding = () => {
    localStorage.removeItem("sb-onboarded");
    router.push("/onboarding");
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header title="Profile & Goals" subtitle="Your personalised settings" />

      <main className="flex-1 px-4 py-5 pb-36 max-w-md mx-auto w-full space-y-6">

        {/* Avatar + name */}
        <section className="rounded-2xl bg-surface-card border border-zinc-800 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Identity</h2>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((e) => (
              <button
                key={e}
                onClick={() => setAvatar(e)}
                className={[
                  "h-11 w-11 rounded-xl text-xl flex items-center justify-center border-2 transition-all",
                  avatar === e ? "border-brand bg-brand/20 scale-110" : "border-zinc-700 bg-surface-elevated",
                ].join(" ")}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl bg-surface-elevated border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand"
          />
        </section>

        {/* Body & goal */}
        <section className="rounded-2xl bg-surface-card border border-zinc-800 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Body & Goal</h2>

          {/* Weight stepper */}
          <div>
            <p className="text-xs text-zinc-500 mb-2">Body weight</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setWeight((w) => Math.max(40, w - 1)); setOverride(null); }}
                className="h-10 w-10 rounded-xl bg-surface-elevated border border-zinc-700 text-lg text-zinc-300 flex items-center justify-center hover:bg-zinc-700"
              >−</button>
              <div className="flex-1 rounded-xl bg-surface-elevated border border-zinc-700 py-2.5 text-center">
                <span className="text-xl font-bold text-zinc-100">{weight}</span>
                <span className="text-xs text-zinc-500 ml-1">kg</span>
              </div>
              <button
                onClick={() => { setWeight((w) => Math.min(200, w + 1)); setOverride(null); }}
                className="h-10 w-10 rounded-xl bg-surface-elevated border border-zinc-700 text-lg text-zinc-300 flex items-center justify-center hover:bg-zinc-700"
              >+</button>
            </div>
          </div>

          {/* Goal selector */}
          <div className="space-y-2">
            {GOALS.map(({ key, label, desc, emoji, color }) => (
              <button
                key={key}
                onClick={() => { setGoal(key); setOverride(null); }}
                className={[
                  "w-full rounded-xl border px-4 py-3 flex items-center gap-3 text-left transition-all",
                  goal === key ? color : "border-zinc-800 bg-surface-elevated",
                ].join(" ")}
              >
                <span className="text-xl">{emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-100">{label}</p>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
                <div className={[
                  "h-4 w-4 rounded-full border-2 flex-shrink-0",
                  goal === key ? "border-brand bg-brand" : "border-zinc-600",
                ].join(" ")} />
              </button>
            ))}
          </div>
        </section>

        {/* Calorie target */}
        <section className="rounded-2xl bg-surface-card border border-zinc-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Daily Calorie Target</h2>
            {override !== null && (
              <button
                onClick={() => setOverride(null)}
                className="text-xs text-brand-light hover:text-brand"
              >
                Reset to auto
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOverride((prev) => Math.max(1200, (prev ?? autoCalorie) - 50))}
              className="h-10 w-10 rounded-xl bg-surface-elevated border border-zinc-700 text-lg text-zinc-300 flex items-center justify-center hover:bg-zinc-700"
            >−</button>
            <div className={`flex-1 rounded-xl border py-3 text-center transition-colors ${override !== null ? "border-brand/50 bg-brand/5" : "border-zinc-700 bg-surface-elevated"}`}>
              <span className="text-2xl font-bold text-zinc-100">{calorieGoal}</span>
              <span className="text-xs text-zinc-500 ml-1">kcal/day</span>
            </div>
            <button
              onClick={() => setOverride((prev) => Math.min(5000, (prev ?? autoCalorie) + 50))}
              className="h-10 w-10 rounded-xl bg-surface-elevated border border-zinc-700 text-lg text-zinc-300 flex items-center justify-center hover:bg-zinc-700"
            >+</button>
          </div>

          <p className="text-xs text-zinc-600">
            Auto-calculated: <span className="text-zinc-400">{autoCalorie} kcal</span>
            {override !== null && " (manually adjusted)"}
          </p>

          {/* Macro split */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: "Protein",  g: Math.round((calorieGoal * 0.30) / 4), color: "text-sky-400",    bar: "bg-sky-500" },
              { label: "Carbs",    g: Math.round((calorieGoal * 0.45) / 4), color: "text-amber-400",  bar: "bg-amber-500" },
              { label: "Fat",      g: Math.round((calorieGoal * 0.25) / 9), color: "text-rose-400",   bar: "bg-rose-500" },
            ].map(({ label, g, color, bar }) => (
              <div key={label} className="text-center">
                <div className={`h-1 rounded-full mb-1.5 ${bar}`} />
                <p className={`text-sm font-bold ${color}`}>{g}g</p>
                <p className="text-xs text-zinc-600">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Work pattern */}
        <section className="rounded-2xl bg-surface-card border border-zinc-800 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Work Pattern</h2>

          <div>
            <p className="text-xs text-zinc-500 mb-2">Typical role</p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={[
                    "rounded-xl px-3 py-1.5 text-xs font-medium border transition-colors",
                    role === r ? "bg-brand text-white border-brand" : "bg-surface-elevated text-zinc-400 border-zinc-700",
                  ].join(" ")}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">Usual work days</p>
            <div className="flex gap-1.5">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => toggleDay(i)}
                  className={[
                    "flex-1 rounded-xl py-2.5 text-xs font-semibold border transition-colors",
                    workDays.includes(i) ? "bg-brand text-white border-brand" : "bg-surface-elevated text-zinc-500 border-zinc-700",
                  ].join(" ")}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="rounded-2xl bg-surface-card border border-zinc-800 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300">Account</h2>
          <button
            onClick={resetOnboarding}
            className="w-full text-xs text-red-500 hover:text-red-400 py-2 transition-colors text-left"
          >
            Re-run onboarding →
          </button>
        </section>

      </main>

      {/* Sticky save bar */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 bg-gradient-to-t from-surface via-surface/95 to-transparent pt-6">
        <Button size="lg" fullWidth onClick={save}>
          Save Changes
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
