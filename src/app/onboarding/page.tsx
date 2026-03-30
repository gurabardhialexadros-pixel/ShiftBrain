"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SleepWheel from "@/components/sleep/SleepWheel";
import Button from "@/components/ui/Button";
import type { SleepSchedule, Time } from "@/lib/types";
import { type UserProfile, calcCalorieGoal, DEFAULT_PROFILE } from "@/lib/profile";

// ─── constants ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

const AVATARS = ["💪", "🧠", "🔥", "⚡", "🎯", "🦁", "🐺", "🚀"];

const ROLES = ["Floor Lead", "Cashier", "Supervisor", "Stocking", "Manager", "Other"];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const GOALS: { key: UserProfile["goalType"]; label: string; desc: string; emoji: string }[] = [
  { key: "cut",      label: "Lose Fat",     desc: "Calorie deficit · preserve muscle",  emoji: "🔥" },
  { key: "maintain", label: "Stay Lean",    desc: "Maintenance calories · recomp",       emoji: "⚖️" },
  { key: "bulk",     label: "Build Muscle", desc: "Calorie surplus · progressive load",  emoji: "💪" },
];

const DEFAULT_SLEEP: SleepSchedule = {
  bedtime:    { hours: 23, minutes: 0 },
  wakeTime:   { hours: 7,  minutes: 0 },
  targetHours: 8,
};

// ─── step sub-components ─────────────────────────────────────────────────────

function StepWelcome({
  name, setName, avatar, setAvatar,
}: {
  name: string; setName: (v: string) => void;
  avatar: string; setAvatar: (v: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-5xl mb-4">🧠</div>
        <h1 className="text-2xl font-bold text-zinc-100">Welcome to ShiftBrain</h1>
        <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
          Your personal lifestyle optimizer — built around your shifts, sleep, and goals.
        </p>
      </div>

      {/* Avatar */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-3">Pick your avatar</p>
        <div className="flex gap-2 flex-wrap">
          {AVATARS.map((e) => (
            <button
              key={e}
              onClick={() => setAvatar(e)}
              className={[
                "h-12 w-12 rounded-2xl text-2xl flex items-center justify-center border-2 transition-all",
                avatar === e
                  ? "border-brand bg-brand/20 scale-110"
                  : "border-zinc-700 bg-surface-card",
              ].join(" ")}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2">Your name</p>
        <input
          type="text"
          placeholder="e.g. Jordan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl bg-surface-card border border-zinc-700 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand"
        />
      </div>
    </div>
  );
}

function StepSleep({
  sleep, setSleep,
}: {
  sleep: SleepSchedule;
  setSleep: (s: SleepSchedule) => void;
}) {
  const handleChange = useCallback(
    (type: "bed" | "wake", time: Time) => {
      setSleep({
        ...sleep,
        bedtime:  type === "bed"  ? time : sleep.bedtime,
        wakeTime: type === "wake" ? time : sleep.wakeTime,
      });
    },
    [sleep, setSleep]
  );

  const TARGET_OPTIONS = [6, 7, 7.5, 8, 8.5, 9];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Sleep Schedule</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Drag the handles to set your usual bedtime and wake time.
        </p>
      </div>

      <SleepWheel
        bedtime={sleep.bedtime}
        wakeTime={sleep.wakeTime}
        onChange={handleChange}
      />

      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2">Target sleep duration</p>
        <div className="flex gap-2 flex-wrap">
          {TARGET_OPTIONS.map((h) => (
            <button
              key={h}
              onClick={() => setSleep({ ...sleep, targetHours: h })}
              className={[
                "flex-1 min-w-[52px] rounded-xl py-2 text-xs font-semibold border transition-colors",
                sleep.targetHours === h
                  ? "bg-brand text-white border-brand"
                  : "bg-surface-card text-zinc-400 border-zinc-700",
              ].join(" ")}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepGoal({
  weight, setWeight,
  goal, setGoal,
}: {
  weight: number; setWeight: (v: number) => void;
  goal: UserProfile["goalType"]; setGoal: (v: UserProfile["goalType"]) => void;
}) {
  const projected = calcCalorieGoal(weight, goal);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Body & Goal</h2>
        <p className="text-zinc-500 text-sm mt-1">
          We'll use this to personalise your calorie targets.
        </p>
      </div>

      {/* Weight */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2">Body weight (kg)</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeight(Math.max(40, weight - 1))}
            className="h-11 w-11 rounded-xl bg-surface-elevated border border-zinc-700 text-xl text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            −
          </button>
          <div className="flex-1 rounded-2xl bg-surface-card border border-zinc-700 py-3 text-center">
            <span className="text-2xl font-bold text-zinc-100">{weight}</span>
            <span className="text-sm text-zinc-500 ml-1">kg</span>
          </div>
          <button
            onClick={() => setWeight(Math.min(200, weight + 1))}
            className="h-11 w-11 rounded-xl bg-surface-elevated border border-zinc-700 text-xl text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Goal */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2">Your goal</p>
        <div className="space-y-2">
          {GOALS.map(({ key, label, desc, emoji }) => (
            <button
              key={key}
              onClick={() => setGoal(key)}
              className={[
                "w-full rounded-2xl border p-4 flex items-center gap-4 text-left transition-all",
                goal === key
                  ? "bg-brand/10 border-brand/50"
                  : "bg-surface-card border-zinc-800 hover:border-zinc-700",
              ].join(" ")}
            >
              <span className="text-2xl">{emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-100">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
              </div>
              <div
                className={[
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  goal === key ? "border-brand bg-brand" : "border-zinc-600",
                ].join(" ")}
              >
                {goal === key && (
                  <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Projected calorie target */}
      <div className="rounded-2xl bg-emerald-900/20 border border-emerald-800/40 px-4 py-3 flex items-center justify-between">
        <p className="text-xs text-zinc-400">Your daily calorie target</p>
        <p className="text-lg font-bold text-emerald-400">{projected} kcal</p>
      </div>
    </div>
  );
}

function StepWork({
  role, setRole,
  workDays, setWorkDays,
}: {
  role: string; setRole: (v: string) => void;
  workDays: number[]; setWorkDays: (v: number[]) => void;
}) {
  const toggleDay = (i: number) => {
    setWorkDays(
      workDays.includes(i) ? workDays.filter((d) => d !== i) : [...workDays, i]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Work Pattern</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Your typical shift role and working days.
        </p>
      </div>

      {/* Role */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2">Typical role</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={[
                "rounded-xl px-4 py-2 text-xs font-medium border transition-colors",
                role === r
                  ? "bg-brand text-white border-brand"
                  : "bg-surface-card text-zinc-400 border-zinc-700 hover:text-zinc-200",
              ].join(" ")}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Work days */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2">
          Days you usually work
        </p>
        <div className="flex gap-1.5">
          {DAYS.map((day, i) => (
            <button
              key={day}
              onClick={() => toggleDay(i)}
              className={[
                "flex-1 rounded-xl py-3 text-xs font-semibold border transition-colors",
                workDays.includes(i)
                  ? "bg-brand text-white border-brand"
                  : "bg-surface-card text-zinc-500 border-zinc-700",
              ].join(" ")}
            >
              {day}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          {workDays.length} day{workDays.length !== 1 ? "s" : ""} selected
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl bg-surface-card border border-zinc-800 p-4 space-y-2">
        <p className="text-xs font-medium text-zinc-400">ShiftBrain will:</p>
        {[
          "Auto-schedule gym on your days off",
          "Adjust gym time around your shifts",
          "Pre-fill meal timing for your schedule",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-brand flex-shrink-0" />
            <p className="text-xs text-zinc-400">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 0 — welcome
  const [name, setName]     = useState("");
  const [avatar, setAvatar] = useState("💪");

  // Step 1 — sleep
  const [sleep, setSleep]   = useState<SleepSchedule>(DEFAULT_SLEEP);

  // Step 2 — goal
  const [weight, setWeight] = useState(80);
  const [goal, setGoal]     = useState<UserProfile["goalType"]>("maintain");

  // Step 3 — work
  const [role, setRole]         = useState("Floor Lead");
  const [workDays, setWorkDays] = useState([0, 1, 2, 3, 4]);

  const canAdvance = [
    name.trim().length > 0,   // step 0: name required
    true,                      // step 1: sleep always valid
    weight > 0,                // step 2: weight valid
    workDays.length > 0,       // step 3: at least one work day
  ][step];

  const finish = () => {
    const calorieGoal = calcCalorieGoal(weight, goal);

    const profile: UserProfile = {
      name: name.trim(),
      avatarEmoji: avatar,
      bodyWeightKg: weight,
      goalType: goal,
      calorieGoal,
      typicalRole: role,
      workDays,
    };

    localStorage.setItem("sb-profile",    JSON.stringify(profile));
    localStorage.setItem("sb-sleep",      JSON.stringify(sleep));
    localStorage.setItem("sb-onboarded",  "true");

    router.push("/dashboard");
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else finish();
  };

  const back = () => setStep((s) => s - 1);

  return (
    <div className="flex min-h-screen flex-col bg-surface px-5 py-10">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={[
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i <= step ? "bg-brand" : "bg-zinc-800",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Step label */}
      <p className="text-xs text-zinc-600 mb-6">
        Step {step + 1} of {TOTAL_STEPS}
      </p>

      {/* Step content */}
      <div className="flex-1">
        {step === 0 && (
          <StepWelcome name={name} setName={setName} avatar={avatar} setAvatar={setAvatar} />
        )}
        {step === 1 && (
          <StepSleep sleep={sleep} setSleep={setSleep} />
        )}
        {step === 2 && (
          <StepGoal weight={weight} setWeight={setWeight} goal={goal} setGoal={setGoal} />
        )}
        {step === 3 && (
          <StepWork role={role} setRole={setRole} workDays={workDays} setWorkDays={setWorkDays} />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="ghost" size="lg" onClick={back}>
            Back
          </Button>
        )}
        <Button
          size="lg"
          fullWidth
          disabled={!canAdvance}
          onClick={next}
        >
          {step === TOTAL_STEPS - 1 ? "Let's go 🚀" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
