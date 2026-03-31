"use client";

import { useRef, useState, useCallback } from "react";
import type { Time } from "@/lib/types";
import {
  timeToAngle,
  angleToTime,
  polar,
  svgArcPath,
  sleepDuration,
  formatDuration,
  formatTime,
  addMinutes,
  timeToMinutes,
} from "@/lib/utils/time";

interface SleepWheelProps {
  bedtime: Time;
  wakeTime: Time;
  onChange: (type: "bed" | "wake", time: Time) => void;
  /** Called when the user drags the arc body (shifts both handles together) */
  onBothChange?: (bed: Time, wake: Time) => void;
}

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;
const TRACK_R = 108;
const HANDLE_R = 15;

const TICKS = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * 360 - 90;
  const isMain = i % 6 === 0;
  return {
    angle, isMain,
    p1: polar(CX, CY, isMain ? TRACK_R - 18 : TRACK_R - 10, angle),
    p2: polar(CX, CY, TRACK_R - 3, angle),
    label: i === 0 ? "12" : i === 6 ? "6" : i === 12 ? "12" : i === 18 ? "18" : "",
    labelPos: polar(CX, CY, TRACK_R - 28, angle),
    hour: i,
  };
});

export default function SleepWheel({ bedtime, wakeTime, onChange, onBothChange }: SleepWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<"bed" | "wake" | "arc" | null>(null);
  const arcDragStart = useRef<{ angle: number; bedtime: Time; wakeTime: Time } | null>(null);

  const getAngle = useCallback((clientX: number, clientY: number): number => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = SIZE / rect.width;
    const sy = SIZE / rect.height;
    const x = (clientX - rect.left) * sx - CX;
    const y = (clientY - rect.top) * sy - CY;
    return Math.atan2(y, x) * (180 / Math.PI);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      e.preventDefault();
      const angle = getAngle(e.clientX, e.clientY);

      if (dragging === "arc" && arcDragStart.current) {
        let deltaAngle = angle - arcDragStart.current.angle;
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;
        // Snap to 15-minute increments
        const deltaMinutes = Math.round((deltaAngle / 360) * 1440 / 15) * 15;
        const newBed  = addMinutes(arcDragStart.current.bedtime,  deltaMinutes);
        const newWake = addMinutes(arcDragStart.current.wakeTime, deltaMinutes);
        onBothChange?.(newBed, newWake);
        return;
      }

      onChange(dragging as "bed" | "wake", angleToTime(angle));
    },
    [dragging, getAngle, onChange, onBothChange]
  );

  const onPointerUp = useCallback(() => {
    setDragging(null);
    arcDragStart.current = null;
  }, []);

  const startDrag = (type: "bed" | "wake", e: React.PointerEvent<SVGCircleElement>) => {
    e.preventDefault();
    setDragging(type);
    (e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId);
  };

  const startArcDrag = (e: React.PointerEvent<SVGPathElement>) => {
    e.preventDefault();
    arcDragStart.current = { angle: getAngle(e.clientX, e.clientY), bedtime, wakeTime };
    setDragging("arc");
    (e.currentTarget as SVGPathElement).setPointerCapture(e.pointerId);
  };

  const bedAngle  = timeToAngle(bedtime);
  const wakeAngle = timeToAngle(wakeTime);
  const bedPos    = polar(CX, CY, TRACK_R, bedAngle);
  const wakePos   = polar(CX, CY, TRACK_R, wakeAngle);
  const arcD      = svgArcPath(CX, CY, TRACK_R, bedtime, wakeTime);
  const durationMins  = sleepDuration(bedtime, wakeTime);
  const durationLabel = formatDuration(durationMins);

  return (
    <div className="flex flex-col items-center gap-5">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[280px] touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Background ring */}
        <circle cx={CX} cy={CY} r={TRACK_R} fill="none" stroke="#27272a" strokeWidth="20" />

        {/* Visible sleep arc */}
        {arcD && (
          <path
            d={arcD}
            fill="none"
            stroke="url(#sleepGrad)"
            strokeWidth="20"
            strokeLinecap="round"
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* Invisible wide hit zone on the arc — dragging this shifts both handles */}
        {arcD && onBothChange && (
          <path
            d={arcD}
            fill="none"
            stroke="white"
            strokeWidth="32"
            strokeOpacity="0.01"
            strokeLinecap="round"
            style={{ cursor: dragging === "arc" ? "grabbing" : "grab" }}
            onPointerDown={startArcDrag}
          />
        )}

        <defs>
          <linearGradient id="sleepGrad" gradientUnits="userSpaceOnUse"
            x1={bedPos.x} y1={bedPos.y} x2={wakePos.x} y2={wakePos.y}>
            <stop offset="0%"   stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        {/* Tick marks */}
        {TICKS.map(({ angle, isMain, p1, p2, label, labelPos, hour }) => (
          <g key={hour}>
            <line
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={isMain ? "#52525b" : "#3f3f46"}
              strokeWidth={isMain ? 2 : 1}
            />
            {label && (
              <text x={labelPos.x} y={labelPos.y + 4} textAnchor="middle"
                fill="#52525b" fontSize="9" fontFamily="system-ui, sans-serif">
                {label}
              </text>
            )}
          </g>
        ))}

        {/* Center duration */}
        <text x={CX} y={CY - 8} textAnchor="middle" fill="#e4e4e7"
          fontSize="22" fontWeight="600" fontFamily="system-ui, sans-serif">
          {durationLabel}
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fill="#52525b"
          fontSize="11" fontFamily="system-ui, sans-serif">
          sleep
        </text>

        {/* Bedtime handle */}
        <circle cx={bedPos.x} cy={bedPos.y} r={HANDLE_R}
          fill="#6366f1" stroke="#0f0f11" strokeWidth="3"
          style={{ cursor: dragging === "bed" ? "grabbing" : "grab" }}
          onPointerDown={(e) => startDrag("bed", e)}
        />
        <text x={bedPos.x} y={bedPos.y + 5} textAnchor="middle"
          fontSize="13" style={{ pointerEvents: "none" }}>🌙</text>

        {/* Wake handle */}
        <circle cx={wakePos.x} cy={wakePos.y} r={HANDLE_R}
          fill="#f59e0b" stroke="#0f0f11" strokeWidth="3"
          style={{ cursor: dragging === "wake" ? "grabbing" : "grab" }}
          onPointerDown={(e) => startDrag("wake", e)}
        />
        <text x={wakePos.x} y={wakePos.y + 5} textAnchor="middle"
          fontSize="13" style={{ pointerEvents: "none" }}>☀️</text>
      </svg>

      {/* Time cards */}
      <div className="flex w-full gap-3">
        <div className="flex-1 rounded-2xl bg-surface-card border border-zinc-800 p-4 text-center">
          <p className="text-xs text-zinc-500 mb-1">🌙 Bedtime</p>
          <p className="text-xl font-semibold text-zinc-100">{formatTime(bedtime)}</p>
        </div>
        <div className="flex-1 rounded-2xl bg-surface-card border border-zinc-800 p-4 text-center">
          <p className="text-xs text-zinc-500 mb-1">☀️ Wake Up</p>
          <p className="text-xl font-semibold text-zinc-100">{formatTime(wakeTime)}</p>
        </div>
      </div>
    </div>
  );
}
