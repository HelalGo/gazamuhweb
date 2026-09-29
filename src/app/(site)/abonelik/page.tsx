import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribe } from "@/lib/newsletter";

export const metadata: Metadata = { title: "Bülten Aboneliği | GAZ-A Mühendislik", robots: { index: false } };
export const dynamic = "force-dynamic";

// E-postalardaki "abonelikten çık" bağlantısı buraya gelir
export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ iptal?: string }> }) {
  const { iptal } = await searchParams;
  const done = iptal ? await unsubscribe(iptal).catch(() => false) : false;
  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-8 pt-44 text-center md:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">Bülten</p>
      <h1 className="mt-3 text-3xl font-light tracking-tight md:text-4xl">{done ? "Abonelikten çıktınız" : "Bağlantı geçersiz"}</h1>
      <p className="mt-4 leading-relaxed text-muted">
        {done
          ? "E-posta adresiniz bülten listemizden çıkarıldı; artık kampanya e-postası almayacaksınız. Sipariş ve üyelikle ilgili bilgilendirmeler gönderilmeye devam eder."
          : "Bu bağlantı geçersiz ya da abonelik zaten sonlandırılmış. Yardım için bizimle iletişime geçebilirsiniz."}
      </p>
      <Link href="/" className="mt-8 inline-flex rounded-[4px] bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white">Ana sayfaya dön</Link>
    </div>
  );
}
