import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteProvider } from "@/components/SiteProvider";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { dbConfigured, getFavoriteIds, getUser } from "@/lib/customer";
import { getMenu } from "@/lib/menu";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, menu] = await Promise.all([getUser(), getMenu()]);
  const favIds = user ? await getFavoriteIds(user.id) : [];
  // Popüler aramalar: en çok ürünü olan kategoriler ve markalar
  const brandTotals = new Map<string, number>();
  for (const b of menu.flatMap((m) => m.brands)) brandTotals.set(b.name, (brandTotals.get(b.name) ?? 0) + b.count);
  const topBrands = [...brandTotals].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name]) => name);
  const popular = [...menu.slice().sort((a, b) => b.count - a.count).slice(0, 4).map((m) => m.label), ...topBrands];
  return (
    <SiteProvider user={user ? { name: user.firstName } : null} favIds={favIds} enabled={dbConfigured()}>
      <Header menu={menu} popular={popular} />
      {children}
      <Footer />
      <WhatsAppButton />
      <CookieConsent />
    </SiteProvider>
  );
}
