"use client";

import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { meals as builtInMeals, getMealsByType } from "@/lib/data/meals";
import type { Meal } from "@/lib/types";
import { type UserProfile, DEFAULT_PROFILE } from "@/lib/profile";

const SECTIONS: { type: Meal["type"]; label: string; emoji: string }[] = [
  { type: "pre-workout",  label: "Pre-Workout",  emoji: "⚡" },
  { type: "post-workout", label: "Post-Workout", emoji: "💪" },
  { type: "lunch",        label: "Work Lunch",   emoji: "🥡" },
  { type: "dinner",       label: "Work Dinner",  emoji: "🍽️" },
  { type: "snack",        label: "Snacks",       emoji: "🌰" },
];

const MACRO_COLORS = {
  protein: "bg-sky-500",
  carbs:   "bg-amber-500",
  fat:     "bg-rose-500",
};

const EMOJI_OPTIONS = ["🍳","🥗","🍗","🥩","🍝","🌯","🥙","🍱","🥣","🍞","🥚","🧀","🥛","🍌","🍎","🥑","🌽","🥦","🐟","🍤","🥜","🌰","🧆","🫙","🥤","🧃"];

const TODAY = new Date().toISOString().split("T")[0];

interface DailyLog { [date: string]: string[] }

type DrawerState = { mode: "closed" } | { mode: "add"; mealType: Meal["type"] };

const EMPTY_FORM = {
  name: "", emoji: "🍳", calories: "", protein: "", carbs: "", fat: "", timing: "", description: "",
};

function MacroBar({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat || 1;
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full gap-0.5 mt-2">
      <div className="bg-sky-500 rounded-full" style={{ width: `${(protein / total) * 100}%` }} />
      <div className="bg-amber-500 rounded-full" style={{ width: `${(carbs / total) * 100}%` }} />
      <div className="bg-rose-500 rounded-full" style={{ width: `${(fat / total) * 100}%` }} />
    </div>
  );
}

export default function MealsPage() {
  const [log, setLog]             = useLocalStorage<DailyLog>("sb-meals-log", {});
  const [profile]                 = useLocalStorage<UserProfile>("sb-profile", DEFAULT_PROFILE);
  const [customMeals, setCustomMeals] = useLocalStorage<Meal[]>("sb-custom-meals", []);
  const [drawer, setDrawer]       = useState<DrawerState>({ mode: "closed" });
  const [form, setForm]           = useState(EMPTY_FORM);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const CALORIE_GOAL = profile.calorieGoal || 2400;
  const todayIds: string[] = log[TODAY] ?? [];

  const allMeals = useMemo(() => [...builtInMeals, ...customMeals], [customMeals]);

  const toggle = (id: string) => {
    setLog((prev) => {
      const current = prev[TODAY] ?? [];
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      return { ...prev, [TODAY]: next };
    });
  };

  const todayMeals = useMemo(() => allMeals.filter((m) => todayIds.includes(m.id)), [allMeals, todayIds]);

  const totals = useMemo(() =>
    todayMeals.reduce(
      (acc, m) => ({ calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    ), [todayMeals]);

  const caloriePct = Math.min(100, Math.round((totals.calories / CALORIE_GOAL) * 100));

  const openAdd = (mealType: Meal["type"]) => {
    setForm(EMPTY_FORM);
    setEmojiOpen(false);
    setDrawer({ mode: "add", mealType });
  };

  const saveCustomMeal = () => {
    if (!form.name.trim() || !form.calories) return;
    if (drawer.mode !== "add") return;
    const meal: Meal = {
      id: `custom-${Date.now()}`,
      name: form.name.trim(),
      emoji: form.emoji,
      calories: Number(form.calories),
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      type: drawer.mealType,
      timing: form.timing.trim() || "Anytime",
      description: form.description.trim(),
    };
    setCustomMeals((prev) => [...prev, meal]);
    setDrawer({ mode: "closed" });
  };

  const deleteCustomMeal = (id: string) => {
    setCustomMeals((prev) => prev.filter((m) => m.id !== id));
    setLog((prev) => {
      const current = prev[TODAY] ?? [];
      return { ...prev, [TODAY]: current.filter((x) => x !== id) };
    });
    setDeleteId(null);
  };

  const getMealsForSection = (type: Meal["type"]) => [
    ...getMealsByType(type),
    ...customMeals.filter((m) => m.type === type),
  ];

  const isCustom = (id: string) => customMeals.some((m) => m.id === id);

  const formValid = form.name.trim().length > 0 && Number(form.calories) > 0;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header title="Meals" subtitle="Tap to log today's food" />

      <main className="flex-1 px-4 py-5 pb-36 max-w-md mx-auto w-full flex flex-col gap-[14px]">

        {/* Daily Calorie Summary */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-zinc-500">Calories today</p>
              <p className="text-3xl font-bold text-zinc-100 mt-0.5">
                {totals.calories.toLocaleString()}
                <span className="text-sm font-normal text-zinc-500 ml-1">/ {CALORIE_GOAL}</span>
              </p>
            </div>
            <p className="text-sm font-semibold text-zinc-400">{caloriePct}%</p>
          </div>
          <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={["h-full rounded-full transition-all duration-500", caloriePct >= 100 ? "bg-emerald-500" : "bg-accent"].join(" ")}
              style={{ width: `${caloriePct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(["protein", "carbs", "fat"] as const).map((macro) => (
              <div key={macro} className="text-center">
                <div className={`h-1 rounded-full mb-1 ${MACRO_COLORS[macro]}`} />
                <p className="text-base font-semibold text-zinc-100">{totals[macro]}g</p>
                <p className="text-xs text-zinc-600 capitalize">{macro}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meal sections */}
        {SECTIONS.map(({ type, label, emoji }) => {
          const sectionMeals = getMealsForSection(type);
          return (
            <section key={type}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-300">{emoji} {label}</h2>
                <button
                  onClick={() => openAdd(type)}
                  className="flex items-center gap-1 text-xs font-medium text-accent/80 hover:text-accent transition-colors"
                >
                  <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Add
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {sectionMeals.map((meal) => {
                  const selected = todayIds.includes(meal.id);
                  const custom = isCustom(meal.id);
                  return (
                    <div key={meal.id} className="relative">
                      <button
                        onClick={() => toggle(meal.id)}
                        className={["w-full text-left rounded-2xl border p-4 transition-all", selected ? "border-accent/40" : "border-white/[0.07]"].join(" ")}
                        style={selected ? {
                          background: "linear-gradient(160deg, rgba(55,58,48,0.88) 0%, rgba(28,30,22,0.94) 55%, rgba(18,18,20,1) 100%)",
                          boxShadow: "inset 0 1px 0 rgba(163,230,53,0.07), 0 4px 20px rgba(0,0,0,0.4)",
                        } : {
                          background: "linear-gradient(160deg, rgba(50,50,53,0.88) 0%, rgba(28,28,30,0.94) 55%, rgba(18,18,20,1) 100%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 20px rgba(0,0,0,0.4)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-2xl flex-shrink-0">{meal.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-zinc-100 truncate">{meal.name}</p>
                                {custom && (
                                  <span className="text-[9px] font-semibold text-accent/70 border border-accent/30 rounded-full px-1.5 py-0.5 flex-shrink-0">
                                    Custom
                                  </span>
                                )}
                              </div>
                              {meal.description && (
                                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{meal.description}</p>
                              )}
                              <p className="text-xs text-zinc-600 mt-0.5">⏱ {meal.timing}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-sm font-bold text-zinc-100">{meal.calories}</p>
                            <p className="text-xs text-zinc-600">kcal</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex gap-3 text-xs text-zinc-500 mb-1">
                            <span className="text-sky-400">{meal.protein}g P</span>
                            <span className="text-amber-400">{meal.carbs}g C</span>
                            <span className="text-rose-400">{meal.fat}g F</span>
                          </div>
                          <MacroBar protein={meal.protein} carbs={meal.carbs} fat={meal.fat} />
                        </div>

                        {selected && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                              <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                                <path d="M1 4l2.5 2.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span className="text-xs text-accent">Logged for today</span>
                          </div>
                        )}
                      </button>

                      {/* Delete button for custom meals */}
                      {custom && (
                        <button
                          onClick={() => setDeleteId(meal.id)}
                          className="absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors"
                          style={{ background: "rgba(0,0,0,0.4)" }}
                        >
                          <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3">
                            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* Add meal drawer */}
      {drawer.mode === "add" && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer({ mode: "closed" })} />
          <div
            className="relative z-10 rounded-t-3xl border-t border-white/[0.08] px-5 pt-5 pb-10 max-h-[88vh] overflow-y-auto"
            style={{ background: "linear-gradient(180deg, rgba(32,32,34,0.98) 0%, rgba(18,18,20,1) 100%)" }}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-5" />

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-zinc-100">
                Add to {SECTIONS.find((s) => s.type === drawer.mealType)?.label}
              </h2>
              <button onClick={() => setDrawer({ mode: "closed" })} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">✕</button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Emoji picker */}
              <div>
                <p className="text-xs text-zinc-500 mb-2">Emoji</p>
                <button
                  onClick={() => setEmojiOpen((o) => !o)}
                  className="h-12 w-12 rounded-2xl border border-white/[0.08] text-2xl flex items-center justify-center"
                  style={{ background: "rgba(40,40,42,0.9)" }}
                >
                  {form.emoji}
                </button>
                {emojiOpen && (
                  <div className="mt-2 grid grid-cols-8 gap-1.5 p-3 rounded-2xl border border-white/[0.07]"
                    style={{ background: "rgba(28,28,30,0.97)" }}>
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => { setForm((f) => ({ ...f, emoji: e })); setEmojiOpen(false); }}
                        className={["h-9 w-9 rounded-xl text-xl flex items-center justify-center transition-all", form.emoji === e ? "bg-accent/20" : "hover:bg-zinc-800"].join(" ")}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <p className="text-xs text-zinc-500 mb-2">Meal name <span className="text-red-500">*</span></p>
                <input
                  type="text"
                  placeholder="e.g. Chicken & Rice"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.07] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50"
                  style={{ background: "rgba(40,40,42,0.9)" }}
                />
              </div>

              {/* Calories */}
              <div>
                <p className="text-xs text-zinc-500 mb-2">Calories (kcal) <span className="text-red-500">*</span></p>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 450"
                  value={form.calories}
                  onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.07] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50"
                  style={{ background: "rgba(40,40,42,0.9)" }}
                />
              </div>

              {/* Macros */}
              <div>
                <p className="text-xs text-zinc-500 mb-2">Macros (g) — optional</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["protein", "carbs", "fat"] as const).map((macro) => (
                    <div key={macro}>
                      <p className={`text-xs mb-1 capitalize ${macro === "protein" ? "text-sky-400" : macro === "carbs" ? "text-amber-400" : "text-rose-400"}`}>{macro}</p>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={form[macro]}
                        onChange={(e) => setForm((f) => ({ ...f, [macro]: e.target.value }))}
                        className="w-full rounded-xl border border-white/[0.07] px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50"
                        style={{ background: "rgba(40,40,42,0.9)" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Timing */}
              <div>
                <p className="text-xs text-zinc-500 mb-2">Timing note — optional</p>
                <input
                  type="text"
                  placeholder="e.g. 30 min before training"
                  value={form.timing}
                  onChange={(e) => setForm((f) => ({ ...f, timing: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.07] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50"
                  style={{ background: "rgba(40,40,42,0.9)" }}
                />
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-zinc-500 mb-2">Description — optional</p>
                <input
                  type="text"
                  placeholder="e.g. Brown rice, chicken breast, veg"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.07] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50"
                  style={{ background: "rgba(40,40,42,0.9)" }}
                />
              </div>

              <button
                onClick={saveCustomMeal}
                disabled={!formValid}
                className="w-full h-14 rounded-2xl font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={formValid ? { background: "#a3e635", color: "#000" } : { background: "rgba(163,230,53,0.15)", color: "#a3e635" }}
              >
                Add Meal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm glass-card p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100">Delete this meal?</h3>
            <p className="text-sm text-zinc-500">It'll be removed from your list permanently.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 h-11 rounded-xl border border-white/[0.08] text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                style={{ background: "rgba(40,40,42,0.6)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCustomMeal(deleteId)}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
