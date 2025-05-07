"use client";

import { useState, ChangeEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import AnimatedSection from '@/components/AnimatedSection';

const MAX_MESSAGE_LENGTH = 1000;

interface FormData {
  name: string;
  email: string;
  phone?: string;
  enquiryType: string;
  message: string;
  attachment?: File | null;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    enquiryType: 'Pre-order Question',
    message: '',
    attachment: null,
  });
  const [charCount, setCharCount] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'message') {
      setCharCount(value.length);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, attachment: e.target.files![0] }));
      setFileName(e.target.files[0].name);
    } else {
      setFormData(prev => ({ ...prev, attachment: null }));
      setFileName(null);
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
          data-netlify="true" 
          data-netlify-honeypot="bot-field"
          className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-6"
        >
          {/* Netlify spam prevention: honeypot field */}
          <input type="hidden" name="form-name" value="contact" />
          <p className="hidden">
            <label>
              Don&apos;t fill this out if you&apos;re human: <input name="bot-field" />
            </label>
          </p>

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

          <div>
            <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
              Attach File/Image <span className="text-gray-500 text-xs">(Optional, max 5MB)</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="attachment" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-dark">
                    <span>Upload a file</span>
                    <input id="attachment" name="attachment" type="file" className="sr-only" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
            {fileName && <p className='mt-2 text-sm text-gray-700'>Selected file: <span className='font-medium'>{fileName}</span></p>}
          </div>

          <div className="pt-2">
            <button
              className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300 disabled:opacity-70"
            >
              <PaperAirplaneIcon className='h-5 w-5 mr-2 text-white'/> Send Enquiry
            </button>
          </div>
        </form>
      </AnimatedSection>
    </div>
  );
} 