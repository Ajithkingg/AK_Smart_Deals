import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-display" });
const body = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono" });

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = {
  metadataBase: new URL("https://ajithkingg.github.io"),
  title: "AK Smart Deals – Trending Products, Best Deals",
  description:
    "AK Smart Deals: handpicked deals on fashion, gadgets, home, beauty and kitchen from Amazon, Flipkart and our own store. Smart shopping, better deals.",
  openGraph: {
    title: "AK Smart Deals",
    description: "Trending products, best deals. Smart shopping, better deals.",
    images: [`${base}/assets/banner.jpg`],
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111111",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
