"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function VisualCore({ xp = 0, level = 1 }: { xp: number; level: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-24 h-24 rounded-full bg-primary/20 animate-pulse" />;

  // Scale and complexity based on level
  const scale = 1 + Math.min((level - 1) * 0.05, 0.5); // Max 1.5x scale
  const rings = Math.min(3 + Math.floor(level / 3), 7); // Start with 3 rings, max 7
  
  // Calculate pulse speed based on XP remainder
  const pulseSpeed = 4 - Math.min((xp % 100) / 100 * 2, 2); // Faster when closer to level up

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/30 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: pulseSpeed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Geometric Rings */}
      {Array.from({ length: rings }).map((_, i) => {
        const size = 100 - i * 12;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/50"
            style={{
              width: `${size}%`,
              height: `${size}%`,
              transform: `scale(${scale})`,
            }}
            animate={{
              rotate: i % 2 === 0 ? 360 : -360,
              scale: [scale, scale * 1.05, scale],
              borderColor: [
                "hsla(var(--primary) / 0.5)",
                "hsla(var(--primary) / 0.8)",
                "hsla(var(--primary) / 0.5)",
              ],
            }}
            transition={{
              rotate: {
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: pulseSpeed,
                repeat: Infinity,
                ease: "easeInOut",
              },
              borderColor: {
                duration: pulseSpeed,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        );
      })}

      {/* Center Core */}
      <motion.div
        className="absolute w-8 h-8 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary))]"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: pulseSpeed / 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Level text inside core */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
         <span className="text-primary-foreground font-bold text-xs mix-blend-difference">{level}</span>
      </div>
    </div>
  );
}
