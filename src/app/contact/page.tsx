/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, FormEvent } from 'react';
import { BuildingOffice2Icon, EnvelopeIcon, PhoneIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

// export const metadata = {
//   title: "Contact DishWish AI | Get In Touch",
//   description: "Have questions, feedback, or partnership inquiries for DishWish AI? Reach out to us through our contact form or find our contact details here.",
// };

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "full-name": fullName,
          email,
          phone,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send message. Please try again.');
      }

      setSubmitStatus({ type: 'success', message: result.message || 'Message sent successfully!' });
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (error: any) {
      setSubmitStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="relative bg-white">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-slate-50" />
      </div>

      <div className="relative max-w-7xl mx-auto lg:grid lg:grid-cols-5">
        <div className="bg-slate-50 py-16 px-4 sm:px-6 lg:col-span-2 lg:px-8 lg:py-24 xl:pr-12">
          <div className="max-w-lg mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Get in touch</h2>
            <p className="mt-4 text-lg leading-7 text-slate-600">
              We&apos;d love to hear from you! Whether you have a question about our features, a suggestion, or anything else, our team is ready to answer all your questions.
            </p>
            <dl className="mt-10 text-base text-slate-600 space-y-6">
              <div>
                <dt className="sr-only">Postal address</dt>
                <dd className="flex items-start">
                  <BuildingOffice2Icon className="flex-shrink-0 h-6 w-6 text-slate-400 mt-0.5" aria-hidden="true" />
                  <span className="ml-3">123 Culinary Tech Ave, Flavor Town, FT 54321</span>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Phone number</dt>
                <dd className="flex items-start">
                  <PhoneIcon className="flex-shrink-0 h-6 w-6 text-slate-400 mt-0.5" aria-hidden="true" />
                  <span className="ml-3">+1 (555) 123-4567</span>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Email</dt>
                <dd className="flex items-start">
                  <EnvelopeIcon className="flex-shrink-0 h-6 w-6 text-slate-400 mt-0.5" aria-hidden="true" />
                  <span className="ml-3">support@dishwish.ai</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white py-16 px-4 sm:px-6 lg:col-span-3 lg:py-24 lg:px-8 xl:pl-12">
          <div className="max-w-lg mx-auto lg:max-w-none">
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Send us a message</h3>
            <p className="text-slate-600 mb-8">Fill out the form below, and we&apos;ll get back to you as soon as possible.</p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6">
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-slate-700 mb-1">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full-name"
                  id="full-name"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full shadow-sm py-3 px-4 placeholder-slate-400 focus:ring-orange-500 focus:border-orange-500 border-slate-300 rounded-md"
                  placeholder="e.g., Alex Doe"
                />
              </div>
              <div>
                <label htmlFor="email-contact" className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email-contact"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full shadow-sm py-3 px-4 placeholder-slate-400 focus:ring-orange-500 focus:border-orange-500 border-slate-300 rounded-md"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone-contact" className="block text-sm font-medium text-slate-700 mb-1">
                  Phone <span className="text-slate-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  id="phone-contact"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full shadow-sm py-3 px-4 placeholder-slate-400 focus:ring-orange-500 focus:border-orange-500 border-slate-300 rounded-md"
                  placeholder="(123) 456-7890"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="block w-full shadow-sm py-3 px-4 placeholder-slate-400 focus:ring-orange-500 focus:border-orange-500 border border-slate-300 rounded-md"
                  placeholder="How can we help you today?"
                />
              </div>
              
              {submitStatus && (
                <div className={`p-3 rounded-md text-sm ${
                  submitStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60 transition-colors"
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
                      <PaperAirplaneIcon className="h-5 w-5 mr-2 -ml-1 transform -rotate-45" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}