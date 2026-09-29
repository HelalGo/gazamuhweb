import type { Metadata } from "next";

export const metadata: Metadata = { title: "Yönetim Paneli | GAZ-A", robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
