import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact Us - Lemme Pop-Up Café | Questions & Feedback",
  description: "Contact Lemme Pop-Up Café in Bath for any questions, pre-order enquiries, or feedback. We are here to help! Event on June 3rd.",
  keywords: ["contact Lemme Cafe", "Lemme Cafe Bath contact", "cafe support Bath", "pop-up cafe questions", "Lemme Cafe feedback", "Lemme Sip Cafe contact"],
  openGraph: {
    title: "Contact Us - Lemme Pop-Up Café",
    description: "Get in touch with Lemme Pop-Up Café for any questions or feedback.",
    url: "https://lemmesipcafe.netlify.app/contact",
  },
  twitter: {
    title: "Contact Us - Lemme Pop-Up Café",
    description: "Get in touch with Lemme Pop-Up Café for any questions or feedback.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 