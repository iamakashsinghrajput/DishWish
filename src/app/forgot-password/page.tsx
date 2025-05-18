"use client";
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to send password reset link.');
      } else {
        setMessage(data.message || 'Password reset link sent successfully!');
        setEmail(''); // Clear email field on success
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Your Password?"
      subtitle="No worries! Enter your email address below and we'll send you a link to reset your password."
      welcomeTitle="Reset Your Access"
      welcomeSubtitle="Let's get you back into your DishWish account."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email_forgot_pass" className="block text-sm font-medium text-gray-700 sr-only">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="email_forgot_pass"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {message && <p className="text-sm text-green-600 text-center">{message}</p>}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {isLoading ? 'Sending Link...' : 'Send Password Reset Link'}
          </button>
        </div>
      </form>
      <p className="mt-8 text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link href="/session/new" className="font-medium text-orange-600 hover:text-orange-500">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}