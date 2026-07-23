"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

// ─── FadeIn ──────────────────────────────────────────────────────────────────

export function FadeIn({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}) {
  const yOffset = direction === "up" ? 16 : direction === "down" ? -16 : 0;
  const xOffset = direction === "left" ? 16 : direction === "right" ? -16 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.25, 0, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerChildren ─────────────────────────────────────────────────────────

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 } as never,
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.25, 0, 1] } as never },
};

export function StaggerList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ─── SkeletonLoader ──────────────────────────────────────────────────────────

export function SkeletonLine({ width = "100%", height = "14px", className = "" }: {
  width?: string; height?: string; className?: string;
}) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ width, height }}
      className={`rounded-md bg-border ${className}`}
    />
  );
}

export function SkeletonCard({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 grid gap-3 ${className}`}>
      <SkeletonLine width="60%" height="18px" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonLine key={i} width={i === lines - 2 ? "40%" : "90%"} height="12px" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="p-3">
                <SkeletonLine width="70%" height="11px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-border last:border-0">
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx} className="p-3">
                  <SkeletonLine width={colIdx === 0 ? "80%" : "50%"} height="13px" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CountUp ─────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

export function CountUp({
  target,
  duration = 1.5,
  prefix = "",
  suffix = "",
  className = "",
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      setCurrent(Math.round(easeOut(progress) * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return (
    <span className={className}>
      {prefix}{current.toLocaleString("es-PY")}{suffix}
    </span>
  );
}

// ─── Pulse (Live indicator) ───────────────────────────────────────────────────

export function PulseDot({ color = "bg-positive" }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <motion.span
        animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}
      />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}
