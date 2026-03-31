"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ShiftForm from "@/components/shifts/ShiftForm";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Shift } from "@/lib/types";
import { formatTime24 } from "@/lib/utils/time";

type FilterTab = "all" | "confirmed" | "pending" | "open";

const statusVariant: Record<Shift["status"], "success" | "warning" | "info"> = {
  confirmed: "success",
  pending: "warning",
  open: "info",
};

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function shiftDuration(s: Shift) {
  const start = s.startTime.hours * 60 + s.startTime.minutes;
  const end = s.endTime.hours * 60 + s.endTime.minutes;
  const diff = ((end - start) + 1440) % 1440;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Build week strip from today
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function buildWeekStrip() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      label: WEEK_DAYS[d.getDay()],
      day: d.getDate(),
      iso: d.toISOString().split("T")[0],
      isToday: i === 0,
    };
  });
}

type DrawerState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; shift: Shift };

export default function ShiftsPage() {
  const [shifts, setShifts] = useLocalStorage<Shift[]>("sb-shifts", []);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const week = useMemo(() => buildWeekStrip(), []);

  const filtered = useMemo(() => {
    const sorted = [...shifts].sort((a, b) => a.date.localeCompare(b.date));
    if (filter === "all") return sorted;
    return sorted.filter((s) => s.status === filter);
  }, [shifts, filter]);

  const saveShift = (shift: Shift) => {
    setShifts((prev) =>
      prev.some((s) => s.id === shift.id)
        ? prev.map((s) => (s.id === shift.id ? shift : s))
        : [...prev, shift]
    );
    setDrawer({ mode: "closed" });
  };

  const deleteShift = (id: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
    setDeleteId(null);
  };

  const shiftOnDay = (iso: string) =>
    shifts.some((s) => s.date === iso);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header
        title="My Shifts"
        subtitle={`${shifts.length} shift${shifts.length !== 1 ? "s" : ""} total`}
        action={
          <Button size="sm" onClick={() => setDrawer({ mode: "add" })}>
            + Add
          </Button>
        }
      />

      <main className="flex-1 px-4 py-5 pb-36 max-w-md mx-auto w-full flex flex-col gap-[14px]">
        {/* Week strip */}
        <div className="flex gap-1.5">
          {week.map(({ label, day, iso, isToday }) => (
            <div
              key={iso}
              className={[
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 border transition-colors",
                isToday
                  ? "bg-accent border-accent"
                  : "border-white/[0.07]",
              ].join(" ")}
              style={!isToday ? {
                background: "linear-gradient(160deg, rgba(50,50,53,0.88) 0%, rgba(28,28,30,0.94) 55%, rgba(18,18,20,1) 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              } : undefined}
            >
              <span className={`text-[10px] font-semibold ${isToday ? "text-black/70" : "text-zinc-500"}`}>
                {label}
              </span>
              <span className={`text-sm font-bold ${isToday ? "text-black" : "text-zinc-300"}`}>
                {day}
              </span>
              {/* dot if shift exists */}
              <div
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  shiftOnDay(iso) ? "bg-accent" : "bg-transparent",
                  isToday && shiftOnDay(iso) ? "bg-black/60" : "",
                ].join(" ")}
              />
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["all", "confirmed", "pending", "open"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                filter === tab
                  ? "bg-accent text-black"
                  : "text-zinc-400 border border-white/[0.07] hover:text-zinc-200",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Shift list */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((shift) => (
              <div
                key={shift.id}
                className="glass-card p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Time column */}
                  <div className="flex-shrink-0 w-[54px] text-center">
                    <p className="text-xs font-mono font-semibold text-zinc-200">
                      {formatTime24(shift.startTime)}
                    </p>
                    <p className="text-xs text-zinc-600">—</p>
                    <p className="text-xs font-mono text-zinc-400">
                      {formatTime24(shift.endTime)}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-px self-stretch bg-zinc-800" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-zinc-100 truncate">
                        {shift.role}
                      </p>
                      <Badge variant={statusVariant[shift.status]}>
                        {shift.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {formatDate(shift.date)} · {shift.location}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {shiftDuration(shift)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => setDrawer({ mode: "edit", shift })}
                    className="flex-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1"
                  >
                    Edit
                  </button>
                  <div className="w-px bg-zinc-800" />
                  <button
                    onClick={() => setDeleteId(shift.id)}
                    className="flex-1 text-xs text-red-500 hover:text-red-400 transition-colors py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center glass-card">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-zinc-600">
                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">No shifts yet</p>
            <p className="text-xs text-zinc-600 mt-1 mb-5">
              {filter !== "all" ? `No ${filter} shifts found` : "Add your first shift to get started"}
            </p>
            {filter === "all" && (
              <Button onClick={() => setDrawer({ mode: "add" })}>
                + Add your first shift
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Add / Edit drawer */}
      {drawer.mode !== "closed" && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawer({ mode: "closed" })}
          />
          {/* Sheet */}
          <div className="relative z-10 rounded-t-3xl bg-surface-card border-t border-zinc-800 px-5 pt-5 pb-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-zinc-100">
                {drawer.mode === "edit" ? "Edit Shift" : "Add Shift"}
              </h2>
              <button
                onClick={() => setDrawer({ mode: "closed" })}
                className="text-zinc-500 hover:text-zinc-300 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <ShiftForm
              initial={drawer.mode === "edit" ? drawer.shift : undefined}
              onSave={saveShift}
              onCancel={() => setDrawer({ mode: "closed" })}
            />
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative z-10 w-full max-w-sm glass-card p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100">Delete shift?</h3>
            <p className="text-sm text-zinc-500">This can't be undone.</p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" fullWidth onClick={() => deleteShift(deleteId)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
