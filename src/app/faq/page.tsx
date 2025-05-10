"use client";

import { useState } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import AnimatedSection from "@/components/AnimatedSection";

export default function FAQPage() {
  // FAQ items
  const faqs = [
    {
      question: "When and where is Lemme Pop-up Café happening?",
      answer: "Lemme Pop-up Café will be open for one day only on June 3rd, 2025, from 10:00 AM to 4:00 PM. We are located at 22C New Bond Street, Bath, BA1 1BA (just a 30-second walk from Waitrose).",
    },
    {
      question: "What kind of drinks do you offer?",
      answer: "We specialise in Japanese-inspired drinks such as Matcha and Hojicha lattes, Yuzu and Genmaicha teas, alongside classic hot coffee and refreshing iced beverages. Check out our full Menu page!",
    },
    {
      question: "How do I pre-order?",
      answer: "You can pre-order through our website's Pre-order page. Select your drinks (and any customisations), specify your pickup time, and provide your name and email. By pre-ordering, your drink preparation will be prioritised when you arrive, allowing you to skip the main queue!",
    },
    {
      question: "Is there a discount for pre-ordering?",
      answer: "Yes! You get 20p off all specialty drinks when you pre-order online. This discount is automatically applied when you select specialty drinks on the Pre-order page.",
    },
    {
      question: "What are your operating hours for the pop-up?",
      answer: "We open from 10:00 AM to 4:00 PM on June 3rd, 2025.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards and contactless payments only (including Apple Pay and Google Pay). Pre-orders are paid for upon pickup using these methods. Please note, we do not accept cash.",
    },
    {
      question: "Can I bring my own cup?",
      answer: "Absolutely! We encourage sustainability. Bring your own reusable cup and receive a 20p discount on your drink.",
    },
    {
      question: "Do you offer dairy-free milk alternatives?",
      answer: "Yes, we offer oat milk as a dairy-free alternative for an additional £0.40.",
    },
    {
      question: "Where can I find more information or updates?",
      answer: "Follow our Instagram page @_lemme.sip_ for the latest news, menu highlights, and behind-the-scenes content! You can also reach out via our Contact page.",
    },
  ];

  // Terms and conditions
  const termsAndConditions = [
    {
      title: "Pre-Order Terms",
      content: "Pre-orders are subject to availability. We reserve the right to limit pre-orders for specific time slots. Payment is required upon pickup. Pre-orders can be modified or cancelled up to 24 hours before the event."
    },
    {
      title: "Allergen Information",
      content: "Our drinks may contain allergens. We maintain a detailed allergen matrix for all drinks, particularly noting milk and dairy products in coffee drinks, allergens in flavored syrups, and allergens in specialty drink ingredients. Please inquire if you have specific allergen concerns."
    },
    {
      title: "Pricing and Payments",
      content: "All prices are inclusive of VAT. We accept credit cards, and contactless payments. Prices listed on our website are accurate at the time of publishing but may be subject to change."
    },
    {
      title: "Sustainability Policy",
      content: "We are committed to minimizing our environmental impact. We use compostable packaging, locally-source our coffee, and offer discounts for customers who bring reusable cups."
    },
    {
      title: "Event Cancellation",
      content: "In the unlikely event of cancellation due to circumstances beyond our control, we will notify all customers who have pre-ordered and provide full refunds if applicable."
    },
    {
      title: "Promotional Offers",
      content: "Promotions cannot be used in conjunction with one another."
    }
  ];

  const [activeTab, setActiveTab] = useState<"faq" | "terms">("faq");

  return (
    <div className="bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] min-h-screen">
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white sm:text-5xl sm:tracking-tight">
              FAQ & Terms
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-white">
              Everything you need to know about Lemme Pop-up Café.
            </p>
          </div>
        </AnimatedSection>

        {/* Tab Navigation */}
        <AnimatedSection delay={0.1}>
          {/* Container for two separate buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
            {/* FAQ Button */}
            <button
              onClick={() => setActiveTab("faq")}
              className={`w-full sm:w-auto bg-primary rounded-lg px-8 py-3 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-dark ${ 
                activeTab === "faq"
                  ? "text-white font-semibold border-2 border-white scale-105"
                  : "text-beige-light/80 hover:text-beige-light border-2 border-beige-light"
              }`}
            >
              FAQ
            </button>
            {/* Terms & Conditions Button */}
            <button
              onClick={() => setActiveTab("terms")}
              className={`w-full sm:w-auto bg-primary rounded-lg px-8 py-3 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-dark ${ 
                activeTab === "terms"
                  ? "text-white font-semibold border-2 border-white scale-105"
                  : "text-beige-light/80 hover:text-beige-light border-2 border-beige-light"
              }`}
            >
              Terms & Conditions
            </button>
          </div>
        </AnimatedSection>

        {/* FAQ Section */}
        {activeTab === "faq" && (
          <AnimatedSection delay={0.2} className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((item, index) => (
                <Disclosure key={index} as="div" className="border border-gray-200 rounded-lg bg-white">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full px-4 py-4 text-left text-[#1a3328] focus:outline-none focus-visible:ring focus-visible:ring-primary-light focus-visible:ring-opacity-75">
                        <span className="font-medium">{item.question}</span>
                        <svg
                          className={`${
                            open ? "transform rotate-180" : ""
                          } w-5 h-5 text-primary`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </Disclosure.Button>
                      <Transition
                        show={open}
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                      >
                        <Disclosure.Panel className="px-4 py-4 pt-0 text-gray-700">
                          {item.answer}
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Terms & Conditions Section */}
        {activeTab === "terms" && (
          <AnimatedSection delay={0.2} className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-filter backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Terms and Conditions
              </h2>
              <div className="space-y-6">
                {termsAndConditions.map((term, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold text-primary-light mb-2">
                      {term.title}
                    </h3>
                    <p className="text-beige-light">{term.content}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/30">
                <h3 className="text-lg font-semibold text-primary-light mb-2">
                  Contact Information
                </h3>
                <p className="text-beige-light">
                  For any questions or concerns regarding these terms, please contact us at{" "}
                  <a href="mailto:lemmesipcafe@gmail.com" className="text-primary-light hover:text-white underline">
                    lemmesipcafe@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
} 
