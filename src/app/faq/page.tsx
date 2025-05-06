"use client";

import { useState } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import AnimatedSection from "@/components/AnimatedSection";

export default function FAQPage() {
  // FAQ items
  const faqItems = [
    {
      question: "When and where is Lemme Pop-up Café happening?",
      answer: "Lemme Pop-up Café will be open for one day only on June 3rd, 2025, from 10:00 AM to 4:00 PM in Bath city centre. The exact location will be announced closer to the date."
    },
    {
      question: "What makes your drinks special?",
      answer: "We specialize in Japanese-inspired specialty drinks that are rarely found in Bath, including Matcha, Hojicha, Yuzu Tea, and Genmaicha. Our drinks combine authentic flavors with high-quality ingredients."
    },
    {
      question: "How do I pre-order?",
      answer: "You can pre-order through our website's pre-order page. Select your drinks, specify your pickup time, and provide your name. We'll have your order ready for you at your chosen time on June 3rd."
    },
    {
      question: "Is there a limit on pre-orders?",
      answer: "We have a limited capacity for pre-orders to ensure quality. Once we reach capacity for a specific time slot, that slot will no longer be available for pre-order."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash, credit cards, and contactless payments on the day of the event. Pre-orders are paid for upon pickup."
    },
    {
      question: "Do you offer any discounts?",
      answer: "Yes! We offer a £0.20 discount for customers who bring their own reusable cups, supporting our commitment to sustainability. We also offer 20p off specialty drinks when you pre-order online."
    },
    {
      question: "How do I get updates about the event?",
      answer: "If you provide your email during pre-order, we'll send you a reminder one day before the event with final details. You can also check our website for the latest information."
    },
    {
      question: "Can I modify or cancel my pre-order?",
      answer: "Yes, you can modify or cancel your pre-order up to 24 hours before the event. Please contact us at lemmesipcafe@gmail.com with your name and order details."
    },
    {
      question: "Do you cater to dietary requirements?",
      answer: "We offer oat milk as a dairy alternative. All our drinks can be customized to suit your preferences."
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
      content: "All prices are inclusive of VAT. We accept cash, credit cards, and contactless payments. Prices listed on our website are accurate at the time of publishing but may be subject to change."
    },
    {
      title: "Sustainability Policy",
      content: "We are committed to minimizing our environmental impact. We use compostable packaging, locally-source our coffee, and offer discounts for customers who bring reusable cups."
    },
    {
      title: "Event Cancellation",
      content: "In the unlikely event of cancellation due to circumstances beyond our control, we will notify all customers who have pre-ordered and provide full refunds if applicable."
    },
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
              {faqItems.map((item, index) => (
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
