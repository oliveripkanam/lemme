import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Pre-order Drinks - Lemme Pop-Up Café | Save Time & Get Discounts",
  description: "Pre-order your favorite Japanese-inspired drinks from Lemme Pop-Up Café in Bath. Save 20p on all specialty drinks like Matcha & Hojicha. Select pickup time for June 3rd and skip the queue!",
  keywords: ["pre-order Lemme Cafe", "Lemme Bath pre-order", "pre-order Japanese drinks Bath", "skip queue cafe Bath", "discount drinks Bath", "Matcha pre-order Bath", "Hojicha pre-order Bath", "Lemme Cafe June 3rd", "Lemme Sip Cafe pre-order"],
  openGraph: {
    title: "Pre-order Drinks - Lemme Pop-Up Café",
    description: "Pre-order your drinks from Lemme Pop-Up Café, save time and get discounts on specialty drinks.",
    url: "https://lemmesipcafe.netlify.app/preorder",
  },
  twitter: {
    title: "Pre-order Drinks - Lemme Pop-Up Café",
    description: "Pre-order your drinks from Lemme Pop-Up Café, save time and get discounts on specialty drinks.",
  },
};

export default function PreorderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 