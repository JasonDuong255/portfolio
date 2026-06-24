import type { Metadata } from "next";
import { getPortfolioContent } from "@/lib/portfolio/storage";
import "@/app/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPortfolioContent();

  return {
    title: content.ui.browserTabName,
    description: content.profile.tagline,
    icons: {
      icon: "/favicon.png"
    }
  };
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
