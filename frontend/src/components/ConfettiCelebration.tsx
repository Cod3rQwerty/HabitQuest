"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function ConfettiCelebration({
  trigger,
  onComplete,
}: ConfettiCelebrationProps) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 1800;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#4f6ef7", "#38bdf8", "#34d399", "#fbbf24", "#f97316"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#4f6ef7", "#38bdf8", "#34d399", "#fbbf24", "#f97316"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        onComplete?.();
      }
    };

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4f6ef7", "#38bdf8", "#34d399", "#fbbf24"],
    });
    frame();
  }, [trigger, onComplete]);

  return null;
}
