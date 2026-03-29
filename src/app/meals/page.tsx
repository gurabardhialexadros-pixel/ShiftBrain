"use client";

import { useMemo } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { meals, getMealsByType } from "@/lib/data/meals";
import type { Meal } from "@/lib/types";

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

const TODAY = new Date().toISOString().split("T")[0];

interface DailyLog {
  [date: string]: string[]; // meal IDs
}

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
  const [log, setLog] = useLocalStorage<DailyLog>("sb-meals-log", {});
  const todayIds: string[] = log[TODAY] ?? [];

  const toggle = (id: string) => {
    setLog((prev) => {
      const current = prev[TODAY] ?? [];
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...prev, [TODAY]: next };
    });
  };

  const todayMeals = useMemo(
    () => meals.filter((m) => todayIds.includes(m.id)),
    [todayIds]
  );

  const totals = useMemo(
    () =>
      todayMeals.reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein:  acc.protein  + m.protein,
          carbs:    acc.carbs    + m.carbs,
          fat:      acc.fat      + m.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [todayMeals]
  );

  const CALORIE_GOAL = 2400;
  const caloriePct = Math.min(100, Math.round((totals.calories / CALORIE_GOAL) * 100));

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header title="Meals" subtitle="Tap to log today's food" />

      <main className="flex-1 px-4 py-5 pb-28 max-w-md mx-auto w-full space-y-6">
        {/* Daily Calorie Summary */}
        <div className="rounded-2xl bg-surface-card border border-zinc-800 p-4 space-y-3">
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

          {/* Progress bar */}
          <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={[
                "h-full rounded-full transition-all duration-500",
                caloriePct >= 100 ? "bg-emerald-500" : "bg-brand",
              ].join(" ")}
              style={{ width: `${caloriePct}%` }}
            />
          </div>

          {/* Macros row */}
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
          const sectionMeals = getMealsByType(type);
          return (
            <section key={type}>
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">
                {emoji} {label}
              </h2>
              <div className="space-y-2">
                {sectionMeals.map((meal) => {
                  const selected = todayIds.includes(meal.id);
                  return (
                    <button
                      key={meal.id}
                      onClick={() => toggle(meal.id)}
                      className={[
                        "w-full text-left rounded-2xl border p-4 transition-all",
                        selected
                          ? "bg-brand/10 border-brand/40"
                          : "bg-surface-card border-zinc-800 hover:border-zinc-700",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">{meal.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-100 truncate">
                              {meal.name}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                              {meal.description}
                            </p>
                            <p className="text-xs text-zinc-600 mt-0.5">⏱ {meal.timing}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-bold text-zinc-100">{meal.calories}</p>
                          <p className="text-xs text-zinc-600">kcal</p>
                        </div>
                      </div>

                      {/* Macro mini-bar */}
                      <div className="mt-3">
                        <div className="flex gap-3 text-xs text-zinc-500 mb-1">
                          <span className="text-sky-400">{meal.protein}g P</span>
                          <span className="text-amber-400">{meal.carbs}g C</span>
                          <span className="text-rose-400">{meal.fat}g F</span>
                        </div>
                        <MacroBar protein={meal.protein} carbs={meal.carbs} fat={meal.fat} />
                      </div>

                      {/* Selected tick */}
                      {selected && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="h-4 w-4 rounded-full bg-brand flex items-center justify-center">
                            <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                              <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span className="text-xs text-brand-light">Logged for today</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
