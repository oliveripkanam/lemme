import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://lemmesipcafe.netlify.app'),
  title: {
    default: "Lemme Pop-Up Café | Japanese-Inspired Drinks in Bath | June 3rd",
    template: "%s - Lemme Pop-Up Café",
  },
  description: "Discover Lemme, a one-day pop-up café in Bath on June 3rd, 2025. Pre-order unique Japanese-inspired specialty drinks like Matcha & Hojicha lattes. Find us at 22C New Bond Street, Bath.",
  keywords: ["Lemme Sip Cafe", "Lemme Bath", "Lemme Cafe", "pop-up cafe Bath", "Japanese drinks Bath", "matcha Bath", "hojicha Bath", "specialty coffee Bath", "pre-order drinks Bath", "June 3rd event Bath", "cafe near Waitrose Bath", "New Bond Street Bath cafe"],
  openGraph: {
    title: "Lemme Pop-Up Café | Japanese-Inspired Drinks in Bath | June 3rd",
    description: "Discover Lemme, a one-day pop-up café in Bath on June 3rd. Pre-order unique Japanese-inspired specialty drinks!",
    url: "https://lemmesipcafe.netlify.app",
    siteName: "Lemme Pop-Up Café",
    images: [
      {
        url: "/images/og-image.png", // Assuming you will add an og-image.png to public/images
        width: 1200,
        height: 630,
        alt: "Lemme Pop-Up Café Banner",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lemme Pop-Up Café | Japanese-Inspired Drinks in Bath | June 3rd",
    description: "Discover Lemme, a one-day pop-up café in Bath on June 3rd. Pre-order unique Japanese-inspired specialty drinks!",
    images: ["/images/og-image.png"], // Assuming you will add an og-image.png to public/images
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow pt-16">{children}</main>
          <Footer />
          <ScrollToTop />
        </div>
      </body>
    </html>
  );
}
