/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emailToUse = emailFromQuery || 'your registered email address';
  const canAttemptResend = !!emailFromQuery;

  const handleResendVerification = async () => {
    if (!emailFromQuery) {
        setError("Email address not found in URL to resend verification.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
        const res = await fetch('/api/auth/register-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailFromQuery }),
        });
        const data = await res.json();
        if (!res.ok) {
            setError(data.message || "Failed to resend verification email.");
        } else {
            setMessage("Verification email resent successfully. Please check your inbox (and spam folder).");
        }
    } catch (err) {
        setError("An error occurred while trying to resend the verification email.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      <p className="text-sm text-slate-600 mb-6">
        If you haven&apos;t received it after a few minutes, make sure to double check your spam/junk folder.
      </p>

      {error && <p className="text-sm text-red-600 text-center mb-4 p-3 bg-red-50 rounded-md">{error}</p>}
      {message && <p className="text-sm text-green-600 text-center mb-4 p-3 bg-green-50 rounded-md">{message}</p>}
      
      {canAttemptResend && (
          <button
          onClick={handleResendVerification}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
          {isLoading ? "Resending..." : "Resend mail"}
          </button>
      )}
      {!canAttemptResend && !error &&(
           <p className="text-sm text-slate-500 mb-4">To resend the verification email, please ensure the correct email address is in the URL or try signing up again.</p>
      )}

      <p className="mt-8 text-sm text-gray-500">
        Already verified? <Link href="/session/new" className="font-medium text-orange-600 hover:text-orange-500">Sign In</Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
        <AuthLayout title="Verify your email" welcomeTitle="Almost There!" welcomeSubtitle="Just one more step to unlock culinary magic.">
            <div className="text-center py-10"><p className="text-slate-600">Loading verification options...</p></div>
        </AuthLayout>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

function VerifyEmailPageContent() {
    const searchParams = useSearchParams(); 
    const emailForSubtitle = searchParams.get('email');

    return (
        <AuthLayout
            title="Verify your email"
            subtitle={`We just sent a verification email to ${emailForSubtitle || 'your registered email address'}. Follow the link in your email to finish up creating your account.`}
            welcomeTitle="Almost There!"
            welcomeSubtitle="Just one more step to unlock culinary magic."
        >
            <VerifyEmailContent />
        </AuthLayout>
    );
}