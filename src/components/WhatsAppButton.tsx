"use client";
import { motion } from "motion/react";
import { WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from "@/lib/site";
import { BrandIcon } from "./SocialIcons";

export function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile yazın"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", delay: 0.8 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-[4px] bg-[#25D366] text-white shadow-lg shadow-black/20"
    >
      <span className="absolute inset-0 animate-ping rounded-[4px] bg-[#25D366] opacity-30" />
      <BrandIcon name="whatsapp" size={30} className="relative" />
    </motion.a>
  );
}
