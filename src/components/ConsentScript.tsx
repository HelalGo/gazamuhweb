"use client";
import { useSyncExternalStore } from "react";
import Script, { type ScriptProps } from "next/script";
import { consentSnapshot, parseConsent, subscribeConsent, type Category } from "@/lib/consent";

// Üçüncü taraf betiği yalnızca ilgili çerez kategorisine izin verildiyse yükler.
// Örnek: <ConsentScript category="analytics" src="https://www.googletagmanager.com/gtag/js?id=G-XXXX" />
export function ConsentScript({ category, ...props }: { category: Exclude<Category, "necessary"> } & ScriptProps) {
  const raw = useSyncExternalStore(subscribeConsent, consentSnapshot, () => "");
  if (!parseConsent(raw)?.choices[category]) return null;
  return <Script strategy="afterInteractive" {...props} />;
}
