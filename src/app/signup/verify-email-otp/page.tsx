/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Suspense, useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import OtpInput from '@/components/auth/OtpInput';

const OTP_VALIDITY_DURATION = 10 * 60 * 1000;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(OTP_VALIDITY_DURATION);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!email && !isLoading) {
      console.warn("No email found in query params for OTP verification. Redirecting.");
      setTimeout(() => router.replace('/signup/new'), 50);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [email, router, isLoading]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const cooldownTimer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(cooldownTimer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);


  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!email) {
        setError("Email not found. Please try the signup process again.");
        return;
    }
    if (otp.length !== 6) {
        setError("Please enter the complete 6-digit OTP.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to verify OTP.');
      } else {
        setMessage(data.message || 'OTP verified successfully!');
        router.push(`/signup/complete-profile?email=${encodeURIComponent(email!)}&token=${encodeURIComponent(data.token)}`);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || resendCooldown > 0) return;
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setCanResend(false); // Disable immediately
    setResendCooldown(60); // 60 seconds cooldown

    try {
      const res = await fetch('/api/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to resend OTP.');
        setCanResend(true); // Allow trying again if failed
      } else {
        setMessage('A new OTP has been sent to your email.');
        setTimeLeft(OTP_VALIDITY_DURATION); // Reset timer
        // No need to setCanResend(true) here, cooldown timer will handle it
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
      setCanResend(true); // Allow trying again if failed
    } finally {
      setIsLoading(false);
    }
  };

  const maskedEmail = email ? `${email.substring(0, Math.min(2, email.indexOf('@')))}****@${email.split('@')[1]}` : 'your email';

  // If email is not yet available (e.g., searchParams still loading), show a minimal loading state
  // This helps prevent rendering the form before `email` is resolved.
  if (!email) {
    return (
        <div className="text-center py-10">
            <p className="text-slate-600">Loading verification details...</p>
            {/* You can add a small spinner here */}
        </div>
    );
  }

  return (
    <>
        <p className="text-center text-slate-600 mb-6 text-sm">
            An OTP has been sent to {maskedEmail}. It is valid for <span className="font-semibold">{formatTime(timeLeft)}</span>.
        </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <OtpInput length={6} onComplete={(completedOtp) => {setOtp(completedOtp);}} disabled={isLoading} />

        {error && <p className="text-sm text-red-600 text-center pt-2">{error}</p>}
        {message && <p className="text-sm text-green-600 text-center pt-2">{message}</p>}

        <div>
          <button
            type="submit"
            disabled={isLoading || otp.length < 6 || !email}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading && !error && !message ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Didn&apos;t receive the code?{' '}
          {(timeLeft === 0 || (canResend && resendCooldown === 0)) ? (
            <button
              onClick={handleResendOtp}
              disabled={isLoading || !email}
              className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-gray-500">
                Resend in {resendCooldown > 0 ? `${resendCooldown}s` : formatTime(timeLeft)}
            </span>
          )}
        </p>
      </div>
    </>
  );
}


// 2. This is your main page component
export default function VerifyEmailOtpPage() {
  return (
    <AuthLayout title="OTP Verification" welcomeTitle="Almost There!" welcomeSubtitle="Let's verify your email to get you started.">
      {/* 3. Wrap the new component in Suspense */}
      <Suspense fallback={<div className="text-center py-10"><p className="text-slate-600">Loading form...</p></div>}>
        <VerifyOtpForm />
      </Suspense>
    </AuthLayout>
  );
}