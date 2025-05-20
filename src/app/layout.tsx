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
  icons: {
    icon: '/images/lemmesquare.png',
    shortcut: '/images/lemmesquare.png',
    apple: '/images/lemmesquare.png',
  },
  openGraph: {
    title: "Lemme Pop-Up Café | Japanese-Inspired Drinks in Bath | June 3rd",
    description: "Discover Lemme, a one-day pop-up café in Bath on June 3rd. Pre-order unique Japanese-inspired specialty drinks!",
    url: "https://lemmesipcafe.netlify.app",
    siteName: "Lemme Pop-Up Café",
    images: [
      {
        url: "/images/lemmesquare.png", 
        width: 1200, // You might want to adjust these if lemmesquare.png has different dimensions
        height: 630, // Or provide an image with these dimensions for optimal OG display
        alt: "Lemme Pop-Up Café Logo",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lemme Pop-Up Café | Japanese-Inspired Drinks in Bath | June 3rd",
    description: "Discover Lemme, a one-day pop-up café in Bath on June 3rd. Pre-order unique Japanese-inspired specialty drinks!",
    images: ["/images/lemmesquare.png"], 
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
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_STRING', 
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
