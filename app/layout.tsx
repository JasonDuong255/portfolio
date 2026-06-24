import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "M. Choice Pixel Portfolio",
  description: "A pixel-art portfolio with editable Supabase CMS content.",
  icons: {
    icon: "/favicon.png"
  }
};

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
