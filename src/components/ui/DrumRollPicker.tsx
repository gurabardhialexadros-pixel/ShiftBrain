"use client";

import { useRef, useEffect, useCallback, useState } from "react";

const ITEM_H  = 42;   // px per item
const VISIBLE = 5;    // must be odd

interface DrumRollPickerProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}

export default function DrumRollPicker({
  value, min, max, step = 1, unit, onChange,
}: DrumRollPickerProps) {
  const values = Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => min + i * step
  );

  const scrollRef  = useRef<HTMLDivElement>(null);
  const debounceId = useRef<ReturnType<typeof setTimeout>>();
  const isSettling = useRef(false);

  const PADDING     = Math.floor(VISIBLE / 2) * ITEM_H;
  const CONTAINER_H = VISIBLE * ITEM_H;

  // Live scroll position for smooth opacity/scale updates
  const [scrollTop, setScrollTop] = useState(
    () => Math.max(0, values.indexOf(value)) * ITEM_H
  );

  const scrollToIdx = useCallback((idx: number, smooth = false) => {
    const el = scrollRef.current;
    if (!el) return;
    if (smooth) {
      el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    } else {
      el.scrollTop = idx * ITEM_H;
    }
  }, []);

  // Sync to external value changes (e.g. controlled parent)
  useEffect(() => {
    const idx = values.indexOf(value);
    if (idx >= 0 && !isSettling.current) scrollToIdx(idx, false);
  // only run when value changes from outside
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const st = el.scrollTop;
    setScrollTop(st);

    clearTimeout(debounceId.current);
    debounceId.current = setTimeout(() => {
      const rawIdx  = st / ITEM_H;
      const idx     = Math.max(0, Math.min(values.length - 1, Math.round(rawIdx)));
      isSettling.current = true;
      scrollToIdx(idx, true);
      onChange(values[idx]);
      setTimeout(() => { isSettling.current = false; }, 250);
    }, 80);
  }, [values, onChange, scrollToIdx]);

  // Per-item visual based on live scroll position
  const itemVisual = (idx: number) => {
    const center = scrollTop / ITEM_H;
    const dist   = Math.abs(idx - center);
    const opacity = dist < 0.5 ? 1 : dist < 1.5 ? 0.45 : 0.16;
    const scale   = dist < 0.5 ? 1 : dist < 1.5 ? 0.88 : 0.76;
    const fontSize = dist < 0.5 ? "1.35rem" : dist < 1.5 ? "1rem" : "0.85rem";
    return { opacity, transform: `scale(${scale})`, fontSize };
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface-card border border-zinc-800" style={{ height: CONTAINER_H }}>
      {/* Selection band */}
      <div
        className="absolute inset-x-0 z-10 pointer-events-none mx-2 rounded-xl"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          height: ITEM_H,
          background: "rgba(99,102,241,0.12)",
          borderTop: "1px solid rgba(99,102,241,0.28)",
          borderBottom: "1px solid rgba(99,102,241,0.28)",
        }}
      />

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          paddingTop: PADDING,
          paddingBottom: PADDING,
        }}
        onScroll={handleScroll}
      >
        {values.map((v, idx) => (
          <div
            key={v}
            className="flex items-center justify-center transition-[opacity,transform] duration-75"
            style={{ height: ITEM_H, scrollSnapAlign: "center", ...itemVisual(idx) }}
            onClick={() => {
              onChange(v);
              scrollToIdx(idx, true);
            }}
          >
            <span className="font-semibold text-zinc-100 tabular-nums">{v}</span>
            {unit && (
              <span className="text-[0.7rem] text-zinc-500 ml-1 font-normal">{unit}</span>
            )}
          </div>
        ))}
      </div>

      {/* Top gradient fade */}
      <div
        className="absolute inset-x-0 top-0 z-20 pointer-events-none"
        style={{ height: PADDING, background: "linear-gradient(to bottom, #0f0f11 20%, transparent)" }}
      />
      {/* Bottom gradient fade */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
        style={{ height: PADDING, background: "linear-gradient(to top, #0f0f11 20%, transparent)" }}
      />
    </div>
  );
}
