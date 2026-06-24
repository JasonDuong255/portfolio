import { PortfolioDesktop } from "@/components/pixel/PortfolioDesktop";
import { ThemeStyle } from "@/lib/portfolio/theme-style";
import { getPortfolioContent } from "@/lib/portfolio/storage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getPortfolioContent();

  return (
    <>
      <ThemeStyle theme={content.theme} />
      <PortfolioDesktop content={content} />
    </>
  );
}
