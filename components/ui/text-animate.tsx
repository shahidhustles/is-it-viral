"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type TextAnimateProps = {
  className?: string;
  text: string;
  type?: "calmInUp" | "fadeIn" | "rollIn";
};

const animationByType = {
  calmInUp: { filter: "blur(0px)", opacity: 1, y: 0 },
  fadeIn: { filter: "blur(0px)", opacity: 1, y: 0 },
  rollIn: { filter: "blur(0px)", opacity: 1, rotate: 0, y: 0 },
} as const;

const initialByType = {
  calmInUp: { filter: "blur(0px)", opacity: 0.64, y: "0.12em" },
  fadeIn: { filter: "blur(2px)", opacity: 0, y: 0 },
  rollIn: { filter: "blur(2px)", opacity: 0, rotate: -8, y: "0.15em" },
} as const;

/**
 * A project-native implementation of Cult UI's documented TextAnimate API.
 * It leaves the full text in the accessibility tree and keeps reduced-motion
 * visitors on the visible resting state.
 */
export function TextAnimate({ className, text, type = "calmInUp" }: TextAnimateProps) {
  const shouldReduceMotion = useReducedMotion();
  const initial = initialByType[type];
  const animate = animationByType[type];

  return (
    <span className={cn("inline-block", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-block whitespace-pre">
        {Array.from(text).map((character, index) => (
          <motion.span
            animate={shouldReduceMotion ? undefined : animate}
            className="inline-block"
            initial={shouldReduceMotion ? false : initial}
            key={`${character}-${index}`}
            transition={{
              delay: index * 0.045,
              duration: 0.52,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {character}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
