import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Menu - Lemme Pop-Up Café | Japanese-Inspired & Classic Drinks",
  description: "Explore the drink menu for Lemme Pop-Up Café in Bath. Featuring Matcha, Hojicha, Yuzu tea, classic coffees, and unique Japanese-inspired specialty drinks. Event on June 3rd.",
  keywords: ["Lemme Cafe menu", "Lemme Bath menu", "Japanese drinks menu Bath", "matcha latte Bath", "hojicha latte Bath", "yuzu tea Bath", "coffee menu Bath", "specialty drinks Bath", "Lemme pop-up menu", "Lemme Sip Cafe menu"],
  openGraph: {
    title: "Menu - Lemme Pop-Up Café",
    description: "Explore the drink menu for Lemme Pop-Up Café: Japanese-inspired & classic drinks.",
    url: "https://lemmesipcafe.netlify.app/menu",
  },
  twitter: {
    title: "Menu - Lemme Pop-Up Café",
    description: "Explore the drink menu for Lemme Pop-Up Café: Japanese-inspired & classic drinks.",
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 