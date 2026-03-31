"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import SleepWheel from "@/components/sleep/SleepWheel";
import Button from "@/components/ui/Button";
import DrumRollPicker from "@/components/ui/DrumRollPicker";
import type { SleepSchedule, Time } from "@/lib/types";
import { type UserProfile, calcCalorieGoal, DEFAULT_PROFILE } from "@/lib/profile";

// ─── constants ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

const AVATARS = ["💪", "🧠", "🔥", "⚡", "🎯", "🦁", "🐺", "🚀", "🏋️", "🧘", "🥊", "🏃"];

const GOALS: { key: UserProfile["goalType"]; label: string; desc: string; emoji: string; color: string }[] = [
  { key: "cut",      label: "Lose Fat",     desc: "Calorie deficit · preserve muscle",  emoji: "🔥", color: "border-orange-500/50 bg-orange-500/10" },
  { key: "maintain", label: "Stay Lean",    desc: "Maintenance calories · recomp",       emoji: "⚖️", color: "border-sky-500/50 bg-sky-500/10"    },
  { key: "bulk",     label: "Build Muscle", desc: "Calorie surplus · progressive load",  emoji: "💪", color: "border-violet-500/50 bg-violet-500/10" },
];

const GENDERS = [
  { key: "male",       label: "Male" },
  { key: "female",     label: "Female" },
  { key: "non-binary", label: "Non-binary" },
  { key: "prefer-not", label: "Prefer not to say" },
] as const;

const ACTIVITY_LEVELS: { key: "low" | "moderate" | "high"; label: string; sublabel: string; emoji: string; color: string }[] = [
  { key: "low",      label: "Low",      sublabel: "Desk job, mostly sitting",    emoji: "💻", color: "border-sky-500/50 bg-sky-500/10"    },
  { key: "moderate", label: "Moderate", sublabel: "On your feet — hospitality",  emoji: "🍽️", color: "border-amber-500/50 bg-amber-500/10" },
  { key: "high",     label: "High",     sublabel: "Physical labour, construction", emoji: "🏗️", color: "border-rose-500/50 bg-rose-500/10"  },
];

const DEFAULT_SLEEP: SleepSchedule = {
  bedtime:    { hours: 23, minutes: 0 },
  wakeTime:   { hours: 7,  minutes: 0 },
  targetHours: 8,
};

const TARGET_OPTIONS = [6, 7, 7.5, 8, 8.5, 9];

// ─── Step 1: Profile ──────────────────────────────────────────────────────────

function StepProfile({
  name, setName, avatar, setAvatar, photoUrl, setPhotoUrl,
}: {
  name: string; setName: (v: string) => void;
  avatar: string; setAvatar: (v: string) => void;
  photoUrl: string; setPhotoUrl: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setPhotoUrl(result);
      setAvatar(""); // clear emoji avatar if photo chosen
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-1">
        <div className="text-5xl mb-3">🧠</div>
        <h1 className="text-2xl font-bold text-zinc-100">Welcome to ShiftBrain</h1>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Built around your shifts, sleep, and goals.
        </p>
      </div>

      {/* Photo / avatar */}
      <div className="flex flex-col items-center gap-4">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        <button
          onClick={() => fileRef.current?.click()}
          className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-dashed border-zinc-600 bg-surface-card flex items-center justify-center hover:border-brand transition-colors"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="profile" className="h-full w-full object-cover" />
          ) : avatar ? (
            <span className="text-4xl">{avatar}</span>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-zinc-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              <span className="text-[10px] text-zinc-600">Upload</span>
            </div>
          )}
          {/* Edit overlay */}
          {(photoUrl || avatar) && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-xs text-white font-medium">Change</span>
            </div>
          )}
        </button>
        <p className="text-xs text-zinc-500">Tap to upload a photo</p>
      </div>

      {/* Emoji avatars */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-3">Or choose an avatar</p>
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map((e) => (
            <button
              key={e}
              onClick={() => { setAvatar(e); setPhotoUrl(""); }}
              className={[
                "h-11 w-11 rounded-2xl text-2xl flex items-center justify-center border-2 transition-all",
                avatar === e && !photoUrl
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

// ─── Step 2: Sleep ────────────────────────────────────────────────────────────

function StepSleep({
  sleep, setSleep, rotatingSchedule, setRotatingSchedule,
}: {
  sleep: SleepSchedule; setSleep: (s: SleepSchedule) => void;
  rotatingSchedule: boolean; setRotatingSchedule: (v: boolean) => void;
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

  const handleBothChange = useCallback(
    (bed: Time, wake: Time) => {
      setSleep({ ...sleep, bedtime: bed, wakeTime: wake });
    },
    [sleep, setSleep]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Sleep Schedule</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Drag handles to set your usual sleep window. Drag the <span className="text-brand-light">arc</span> to shift the whole block.
        </p>
      </div>

      <SleepWheel
        bedtime={sleep.bedtime}
        wakeTime={sleep.wakeTime}
        onChange={handleChange}
        onBothChange={handleBothChange}
      />

      {/* Target duration */}
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

      {/* Rotating schedule toggle */}
      <button
        onClick={() => setRotatingSchedule(!rotatingSchedule)}
        className={[
          "w-full rounded-2xl border p-4 flex items-center gap-4 text-left transition-all",
          rotatingSchedule
            ? "border-brand/50 bg-brand/10"
            : "border-zinc-800 bg-surface-card hover:border-zinc-700",
        ].join(" ")}
      >
        <span className="text-2xl flex-shrink-0">🔄</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-100">Rotating schedule</p>
          <p className="text-xs text-zinc-500 mt-0.5">My sleep times vary week to week</p>
        </div>
        <div className={[
          "h-6 w-10 rounded-full transition-all flex-shrink-0 relative",
          rotatingSchedule ? "bg-brand" : "bg-zinc-700",
        ].join(" ")}>
          <div className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            rotatingSchedule ? "left-[18px]" : "left-0.5",
          ].join(" ")} />
        </div>
      </button>
    </div>
  );
}

// ─── Step 3: Personal Details ─────────────────────────────────────────────────

function StepPersonal({
  age, setAge, gender, setGender, weight, setWeight, goal, setGoal,
}: {
  age: number; setAge: (v: number) => void;
  gender: UserProfile["gender"]; setGender: (v: UserProfile["gender"]) => void;
  weight: number; setWeight: (v: number) => void;
  goal: UserProfile["goalType"]; setGoal: (v: UserProfile["goalType"]) => void;
}) {
  const projected = calcCalorieGoal(weight, goal, "moderate");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">About You</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Helps us tailor your calorie and training targets.
        </p>
      </div>

      {/* Age + Weight side-by-side drum pickers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2">Age</p>
          <DrumRollPicker value={age} min={16} max={80} unit="yr" onChange={setAge} />
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2">Weight</p>
          <DrumRollPicker value={weight} min={40} max={200} unit="kg" onChange={setWeight} />
        </div>
      </div>

      {/* Gender */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2">Gender</p>
        <div className="grid grid-cols-2 gap-2">
          {GENDERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setGender(key)}
              className={[
                "rounded-xl py-2.5 px-3 text-xs font-medium border transition-colors text-left",
                gender === key
                  ? "bg-brand text-white border-brand"
                  : "bg-surface-card text-zinc-400 border-zinc-700 hover:text-zinc-200",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Goal */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2">Your goal</p>
        <div className="space-y-2">
          {GOALS.map(({ key, label, desc, emoji, color }) => (
            <button
              key={key}
              onClick={() => setGoal(key)}
              className={[
                "w-full rounded-2xl border p-4 flex items-center gap-4 text-left transition-all",
                goal === key ? color : "bg-surface-card border-zinc-800 hover:border-zinc-700",
              ].join(" ")}
            >
              <span className="text-2xl">{emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-100">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
              </div>
              <div className={[
                "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                goal === key ? "border-brand bg-brand" : "border-zinc-600",
              ].join(" ")}>
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

      {/* Calorie preview */}
      <div className="rounded-2xl bg-emerald-900/20 border border-emerald-800/40 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500">Daily calorie target</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Refined by activity on next step</p>
        </div>
        <p className="text-xl font-bold text-emerald-400">~{projected} kcal</p>
      </div>
    </div>
  );
}

// ─── Step 4: Lifestyle ────────────────────────────────────────────────────────

function StepLifestyle({
  trainingDays, setTrainingDays,
  activityLevel, setActivityLevel,
  weight, goal,
}: {
  trainingDays: number; setTrainingDays: (v: number) => void;
  activityLevel: "low" | "moderate" | "high"; setActivityLevel: (v: "low" | "moderate" | "high") => void;
  weight: number; goal: UserProfile["goalType"];
}) {
  const finalCalories = calcCalorieGoal(weight, goal, activityLevel);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Your Lifestyle</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Fine-tunes your plan around how active you already are.
        </p>
      </div>

      {/* Training days */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2">Training days per week</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTrainingDays(Math.max(1, trainingDays - 1))}
            className="h-11 w-11 rounded-xl bg-surface-elevated border border-zinc-700 text-xl text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >−</button>
          <div className="flex-1 rounded-2xl bg-surface-card border border-zinc-700 py-3 text-center">
            <span className="text-2xl font-bold text-zinc-100">{trainingDays}</span>
            <span className="text-sm text-zinc-500 ml-1">days</span>
          </div>
          <button
            onClick={() => setTrainingDays(Math.min(7, trainingDays + 1))}
            className="h-11 w-11 rounded-xl bg-surface-elevated border border-zinc-700 text-xl text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >+</button>
        </div>
        <p className="text-xs text-zinc-600 mt-1.5 text-center">
          {trainingDays <= 2 ? "Great starting point" : trainingDays <= 4 ? "Solid training frequency" : trainingDays <= 5 ? "High intensity — make sure to recover" : "Elite level — prioritise sleep & nutrition"}
        </p>
      </div>

      {/* Activity level */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2">Job activity level</p>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map(({ key, label, sublabel, emoji, color }) => (
            <button
              key={key}
              onClick={() => setActivityLevel(key)}
              className={[
                "w-full rounded-2xl border p-4 flex items-center gap-4 text-left transition-all",
                activityLevel === key ? color : "bg-surface-card border-zinc-800 hover:border-zinc-700",
              ].join(" ")}
            >
              <span className="text-2xl flex-shrink-0">{emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-100">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{sublabel}</p>
              </div>
              <div className={[
                "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                activityLevel === key ? "border-brand bg-brand" : "border-zinc-600",
              ].join(" ")}>
                {activityLevel === key && (
                  <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Final calorie summary */}
      <div className="rounded-2xl bg-brand/10 border border-brand/30 px-4 py-4 space-y-1">
        <p className="text-xs text-zinc-500">Your personalised daily calorie target</p>
        <p className="text-3xl font-bold text-brand-light">{finalCalories} <span className="text-base font-normal text-zinc-500">kcal / day</span></p>
        <p className="text-[10px] text-zinc-600">Adjust anytime in Profile</p>
      </div>

      {/* What ShiftBrain will do */}
      <div className="rounded-2xl bg-surface-card border border-zinc-800 p-4 space-y-2.5">
        <p className="text-xs font-semibold text-zinc-400">ShiftBrain will:</p>
        {[
          "Schedule gym sessions around your shifts",
          "Adjust meal timing to your sleep window",
          "Account for your job's calorie burn",
          "Track weekly routine and progress",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-brand flex-shrink-0" />
            <p className="text-xs text-zinc-400">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1 — Profile
  const [name, setName]         = useState("");
  const [avatar, setAvatar]     = useState("💪");
  const [photoUrl, setPhotoUrl] = useState("");

  // Step 2 — Sleep
  const [sleep, setSleep]                         = useState<SleepSchedule>(DEFAULT_SLEEP);
  const [rotatingSchedule, setRotatingSchedule]   = useState(false);

  // Step 3 — Personal
  const [age, setAge]       = useState(25);
  const [gender, setGender] = useState<UserProfile["gender"]>(undefined);
  const [weight, setWeight] = useState(80);
  const [goal, setGoal]     = useState<UserProfile["goalType"]>("maintain");

  // Step 4 — Lifestyle
  const [trainingDays, setTrainingDays]       = useState(4);
  const [activityLevel, setActivityLevel]     = useState<"low" | "moderate" | "high">("moderate");

  const canAdvance = [
    name.trim().length > 0,   // step 0
    true,                      // step 1
    weight > 0,                // step 2
    true,                      // step 3
  ][step];

  const finish = () => {
    const calorieGoal = calcCalorieGoal(weight, goal, activityLevel);

    const profile: UserProfile = {
      name: name.trim(),
      avatarEmoji: avatar || "💪",
      photoUrl: photoUrl || undefined,
      age,
      gender,
      bodyWeightKg: weight,
      goalType: goal,
      calorieGoal,
      typicalRole: "Other",
      workDays: [0, 1, 2, 3, 4],
      activityLevel,
      trainingDaysPerWeek: trainingDays,
      rotatingSchedule,
    };

    localStorage.setItem("sb-profile",   JSON.stringify(profile));
    localStorage.setItem("sb-sleep",     JSON.stringify(sleep));
    localStorage.setItem("sb-onboarded", "true");

    router.push("/dashboard");
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else finish();
  };

  const back = () => setStep((s) => s - 1);

  return (
    <div className="flex min-h-screen flex-col bg-surface px-5 py-8">
      {/* Progress bar */}
      <div className="flex items-center gap-1.5 mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={[
              "h-1 flex-1 rounded-full transition-all duration-400",
              i < step ? "bg-brand" : i === step ? "bg-brand-light" : "bg-zinc-800",
            ].join(" ")}
          />
        ))}
      </div>

      <p className="text-xs text-zinc-600 mb-6">Step {step + 1} of {TOTAL_STEPS}</p>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {step === 0 && (
          <StepProfile
            name={name} setName={setName}
            avatar={avatar} setAvatar={setAvatar}
            photoUrl={photoUrl} setPhotoUrl={setPhotoUrl}
          />
        )}
        {step === 1 && (
          <StepSleep
            sleep={sleep} setSleep={setSleep}
            rotatingSchedule={rotatingSchedule} setRotatingSchedule={setRotatingSchedule}
          />
        )}
        {step === 2 && (
          <StepPersonal
            age={age} setAge={setAge}
            gender={gender} setGender={setGender}
            weight={weight} setWeight={setWeight}
            goal={goal} setGoal={setGoal}
          />
        )}
        {step === 3 && (
          <StepLifestyle
            trainingDays={trainingDays} setTrainingDays={setTrainingDays}
            activityLevel={activityLevel} setActivityLevel={setActivityLevel}
            weight={weight} goal={goal}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-3 flex-shrink-0">
        {step > 0 && (
          <Button variant="ghost" size="lg" onClick={back}>Back</Button>
        )}
        <Button size="lg" fullWidth disabled={!canAdvance} onClick={next}>
          {step === TOTAL_STEPS - 1 ? "Let's go 🚀" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
