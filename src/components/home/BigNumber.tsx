"use client";
import { motion } from "motion/react";

// Rakamlar görünür olunca maske içinden sırayla yukarı kayar
export function BigNumber({ value, className = "" }: { value: string; className?: string }) {
  return (
    <motion.span className={`inline-flex ${className}`} initial="hide" whileInView="show" viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.07 }} aria-label={value}>
      {[...value].map((c, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] leading-none">
          <motion.span className="inline-block" variants={{ hide: { y: "110%" }, show: { y: 0 } }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            {c}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
