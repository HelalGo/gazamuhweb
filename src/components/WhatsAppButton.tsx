"use client";
import { motion } from "motion/react";
import { WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from "@/lib/site";

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
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
      <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" className="relative">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.19 1.6 6.02L4 29l8.13-1.56a12.03 12.03 0 0 0 3.9.65h.01C22.67 28.09 28 22.7 28 16.07 28 9.4 22.68 3 16.04 3Zm0 22.05c-1.2 0-2.38-.32-3.4-.93l-.24-.15-4.83.93.98-4.7-.16-.25a9.9 9.9 0 0 1-1.52-5.3c0-5.5 4.5-9.97 10.03-9.97 5.4 0 9.9 4.5 9.9 10 0 5.5-4.4 10.37-10.76 10.37Zm5.5-7.5c-.3-.15-1.8-.9-2.08-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.96 1.2-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.4-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.68-1.65-.93-2.25-.25-.6-.5-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.1 3.2 5.1 4.5.72.3 1.28.5 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.8-.73 2.05-1.45.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" />
      </svg>
    </motion.a>
  );
}
