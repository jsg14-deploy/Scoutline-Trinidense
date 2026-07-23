"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function FadeIn({ children, delay = 0, className = "", direction = "up" }: FadeInProps) {
  const yOffset = direction === "up" ? 20 : direction === "down" ? -20 : 0;
  const xOffset = direction === "left" ? 20 : direction === "right" ? -20 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.25, 0, 1], // easeOutQuart
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
