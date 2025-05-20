import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FAQ & Terms - Lemme Pop-Up Café | Your Questions Answered",
  description: "Find answers to frequently asked questions about Lemme Pop-Up Café in Bath: event details (June 3rd), pre-orders, drinks, payment, and terms & conditions.",
  keywords: ["Lemme Cafe FAQ", "Lemme Cafe terms", "pop-up cafe Bath FAQ", "Japanese drinks Bath questions", "Lemme Cafe event details", "Lemme Sip Cafe FAQ"],
  openGraph: {
    title: "FAQ & Terms - Lemme Pop-Up Café",
    description: "Find answers to frequently asked questions and view terms for Lemme Pop-Up Café.",
    url: "https://lemmesipcafe.netlify.app/faq",
  },
  twitter: {
    title: "FAQ & Terms - Lemme Pop-Up Café",
    description: "Find answers to frequently asked questions and view terms for Lemme Pop-Up Café.",
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 