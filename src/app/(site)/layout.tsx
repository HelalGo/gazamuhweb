import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteProvider } from "@/components/SiteProvider";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { dbConfigured, getFavoriteIds, getUser } from "@/lib/customer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  const favIds = user ? await getFavoriteIds(user.id) : [];
  return (
    <SiteProvider user={user ? { name: user.firstName } : null} favIds={favIds} enabled={dbConfigured()}>
      <Header />
      {children}
      <Footer />
      <WhatsAppButton />
    </SiteProvider>
  );
}
