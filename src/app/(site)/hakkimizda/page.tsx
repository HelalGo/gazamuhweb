import { LegalPage, legalMeta } from "@/components/LegalPage";

export const metadata = legalMeta("hakkimizda");

export default function Page() {
  return <LegalPage slug="hakkimizda" />;
}
