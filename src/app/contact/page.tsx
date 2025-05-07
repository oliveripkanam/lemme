"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import AnimatedSection from '@/components/AnimatedSection';

const MAX_MESSAGE_LENGTH = 1000;

interface FormData {
  name: string;
  email: string;
  phone?: string;
  enquiryType: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    enquiryType: 'Pre-order Question',
    message: '',
  });
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'message') {
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      
      setIsSubmitting(false);
      setShowSuccessModal(true);
      setFormData({
        name: '', email: '', phone: '', enquiryType: 'Pre-order Question', message: ''
      });
      setCharCount(0);
      (e.target as HTMLFormElement).reset();

    } catch (error: unknown) {
      console.error('Submission error:', error);
      const message = error instanceof Error ? error.message : String(error);
      setSubmitError(`Failed to submit enquiry: ${message}`);
      setIsSubmitting(false);
    }
  };

  const enquiryTypes = [
    'Pre-order Question',
    'General Enquiry',
    'Feedback',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] py-16 px-4 sm:px-6 lg:px-8 text-[#1a3328]">
      <AnimatedSection className="max-w-3xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl font-bold text-white sm:text-5xl tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg sm:text-xl text-gray-200">
            Have a question or feedback? We&apos;d love to hear from you!
          </p>
        </div>

        <form 
          name="contact" 
          method="POST"
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-6"
        >
          <input type="hidden" name="form-name" value="contact" />

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full shadow-sm py-3 px-4 text-gray-800 bg-white border-gray-300 rounded-md focus:ring-primary-dark focus:border-primary-dark"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full shadow-sm py-3 px-4 text-gray-800 bg-white border-gray-300 rounded-md focus:ring-primary-dark focus:border-primary-dark"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="block w-full shadow-sm py-3 px-4 text-gray-800 bg-white border-gray-300 rounded-md focus:ring-primary-dark focus:border-primary-dark"
            />
          </div>

          <div>
            <label htmlFor="enquiryType" className="block text-sm font-medium text-gray-700 mb-1">
              Enquiry Type <span className="text-red-500">*</span>
            </label>
            <select
              id="enquiryType"
              name="enquiryType"
              required
              value={formData.enquiryType}
              onChange={handleChange}
              className="block w-full shadow-sm py-3 px-4 text-gray-800 bg-white border border-gray-300 rounded-md focus:ring-primary-dark focus:border-primary-dark"
            >
              {enquiryTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              value={formData.message}
              onChange={handleChange}
              maxLength={MAX_MESSAGE_LENGTH}
              className="block w-full shadow-sm py-3 px-4 text-gray-800 bg-white border-gray-300 rounded-md focus:ring-primary-dark focus:border-primary-dark"
            ></textarea>
            <p className="mt-1 text-xs text-right text-gray-500">
              {charCount}/{MAX_MESSAGE_LENGTH}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className='h-5 w-5 mr-2 text-white'/> Send Enquiry
                </>
              )}
            </button>
            {submitError && (
               <p className="mt-4 text-center text-sm text-red-600">Error: {submitError}</p>
            )}
          </div>
        </form>
      </AnimatedSection>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md text-center relative"
            >
              <button 
                onClick={() => setShowSuccessModal(false)} 
                className='absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors'
                aria-label="Close success message"
              >
                <XMarkIcon className='h-6 w-6'/>
              </button>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4 sm:mb-5">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#1a3328] mb-3">
                Enquiry Sent!
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                Thank you for reaching out. We&apos;ll respond to your enquiry within 2 business days.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 