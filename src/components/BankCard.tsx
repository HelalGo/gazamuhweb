"use client";
import { useState } from "react";
import Image from "next/image";
import { Check, Copy } from "lucide-react";
import { bank, ibanGroups } from "@/lib/site";

// Havale / EFT bilgileri: banka logosu, alıcı, IBAN (kopyalanabilir); isteğe bağlı tutar ve açıklama
export function BankCard({ amount, reference, compact }: { amount?: string; reference?: string; compact?: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 1600); }).catch(() => {});
  };
  const copyBtn = (k: string, text: string) => (
    <button type="button" onClick={() => copy(k, text)} className="inline-flex shrink-0 items-center gap-1 rounded-[4px] border border-border bg-white px-2 py-1 text-[11px] font-bold text-primary hover:border-primary"
      aria-label={`${k} kopyala`}>
      {copied === k ? <><Check size={12} />Kopyalandı</> : <><Copy size={12} />Kopyala</>}
    </button>
  );
  return (
    <div className={`rounded-[4px] border border-border bg-white ${compact ? "p-4" : "p-5"} text-left`}>
      <div className="flex items-center justify-between gap-3">
        <Image src={bank.logo} alt={bank.name} width={227} height={41} unoptimized className="h-6 w-auto" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Havale / EFT</span>
      </div>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div>
          <dt className="text-xs text-muted">Alıcı</dt>
          <dd className="font-semibold leading-snug">{bank.holder}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">IBAN</dt>
          <dd className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[15px] font-bold tracking-wide text-primary">{ibanGroups(bank.iban)}</span>
            {copyBtn("IBAN", bank.iban)}
          </dd>
        </div>
        {amount && (
          <div className="flex items-center justify-between gap-2">
            <div><dt className="text-xs text-muted">Tutar</dt><dd className="font-bold">{amount}</dd></div>
          </div>
        )}
        {reference && (
          <div>
            <dt className="text-xs text-muted">Açıklama</dt>
            <dd className="flex items-center justify-between gap-2"><span className="font-bold">{reference}</span>{copyBtn("Açıklama", reference)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
