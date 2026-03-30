"use client";

import { useState } from "react";
import type { Shift, Time } from "@/lib/types";
import Button from "@/components/ui/Button";

interface ShiftFormProps {
  initial?: Shift;
  onSave: (shift: Shift) => void;
  onCancel: () => void;
}

const ROLES = ["Floor Lead", "Cashier", "Supervisor", "Stocking", "Manager", "Other"];
const LOCATIONS = ["Store A", "Store B", "Warehouse", "Head Office", "Other"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function timeToString(t: Time) {
  return `${pad(t.hours)}:${pad(t.minutes)}`;
}

function stringToTime(s: string): Time {
  const [h, m] = s.split(":").map(Number);
  return { hours: h ?? 0, minutes: m ?? 0 };
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ShiftForm({ initial, onSave, onCancel }: ShiftFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [role, setRole] = useState(initial?.role ?? "Floor Lead");
  const [customRole, setCustomRole] = useState(
    initial && !ROLES.slice(0, -1).includes(initial.role) ? initial.role : ""
  );
  const [date, setDate] = useState(initial?.date ?? today);
  const [start, setStart] = useState(
    initial ? timeToString(initial.startTime) : "08:00"
  );
  const [end, setEnd] = useState(
    initial ? timeToString(initial.endTime) : "16:00"
  );
  const [location, setLocation] = useState(initial?.location ?? "Store A");
  const [customLocation, setCustomLocation] = useState(
    initial && !LOCATIONS.slice(0, -1).includes(initial.location)
      ? initial.location
      : ""
  );
  const [status, setStatus] = useState<Shift["status"]>(
    initial?.status ?? "confirmed"
  );

  const finalRole = role === "Other" ? customRole : role;
  const finalLocation = location === "Other" ? customLocation : location;

  const valid =
    finalRole.trim().length > 0 &&
    finalLocation.trim().length > 0 &&
    date.length > 0;

  const handleSubmit = () => {
    if (!valid) return;
    onSave({
      id: initial?.id ?? uid(),
      role: finalRole.trim(),
      date,
      startTime: stringToTime(start),
      endTime: stringToTime(end),
      location: finalLocation.trim(),
      status,
    });
  };

  return (
    <div className="space-y-4">
      {/* Role */}
      <div>
        <label className="text-xs font-medium text-zinc-400 block mb-1.5">
          Role
        </label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={[
                "rounded-xl px-3 py-1.5 text-xs font-medium border transition-colors",
                role === r
                  ? "bg-brand text-white border-brand"
                  : "bg-surface-elevated text-zinc-400 border-zinc-700 hover:text-zinc-200",
              ].join(" ")}
            >
              {r}
            </button>
          ))}
        </div>
        {role === "Other" && (
          <input
            type="text"
            placeholder="Enter role name"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            className="mt-2 w-full rounded-xl bg-surface-elevated border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand"
          />
        )}
      </div>

      {/* Date */}
      <div>
        <label className="text-xs font-medium text-zinc-400 block mb-1.5">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl bg-surface-elevated border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-brand [color-scheme:dark]"
        />
      </div>

      {/* Times */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-zinc-400 block mb-1.5">
            Start
          </label>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-xl bg-surface-elevated border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-brand [color-scheme:dark]"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-zinc-400 block mb-1.5">
            End
          </label>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-xl bg-surface-elevated border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-brand [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-xs font-medium text-zinc-400 block mb-1.5">
          Location
        </label>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((l) => (
            <button
              key={l}
              onClick={() => setLocation(l)}
              className={[
                "rounded-xl px-3 py-1.5 text-xs font-medium border transition-colors",
                location === l
                  ? "bg-brand text-white border-brand"
                  : "bg-surface-elevated text-zinc-400 border-zinc-700 hover:text-zinc-200",
              ].join(" ")}
            >
              {l}
            </button>
          ))}
        </div>
        {location === "Other" && (
          <input
            type="text"
            placeholder="Enter location"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            className="mt-2 w-full rounded-xl bg-surface-elevated border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand"
          />
        )}
      </div>

      {/* Status */}
      <div>
        <label className="text-xs font-medium text-zinc-400 block mb-1.5">
          Status
        </label>
        <div className="flex gap-2">
          {(["confirmed", "pending", "open"] as Shift["status"][]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={[
                "flex-1 rounded-xl py-2 text-xs font-medium border capitalize transition-colors",
                status === s
                  ? s === "confirmed"
                    ? "bg-emerald-900/60 text-emerald-400 border-emerald-800"
                    : s === "pending"
                    ? "bg-amber-900/60 text-amber-400 border-amber-800"
                    : "bg-indigo-900/60 text-indigo-400 border-indigo-800"
                  : "bg-surface-elevated text-zinc-500 border-zinc-700",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button fullWidth disabled={!valid} onClick={handleSubmit}>
          {initial ? "Save Changes" : "Add Shift"}
        </Button>
      </div>
    </div>
  );
}
