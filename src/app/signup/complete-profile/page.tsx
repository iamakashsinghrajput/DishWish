"use client";
import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // This useEffect can stay here as it depends on email and token derived from searchParams
  useEffect(() => {
    // This check runs after searchParams are available.
    // If email or token is still null after Suspense resolves, then it's truly missing.
    if (!email || !token) {
      setError("Required information for completing your profile is missing. Please ensure you've verified your email via the link/OTP provided.");
      // Consider a more user-friendly way to handle this, maybe redirecting after a delay.
      // For now, the error message will be displayed below.
    }
  }, [email, token]); // email and token will be non-null or null after Suspense


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
    }
    if (!email || !token) { // Double check here, though useEffect should catch it
        setError('Verification token or email is missing. Please restart the sign-up process.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, firstName, lastName, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to complete registration.');
      } else {
        setMessage(data.message || 'Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/session/new');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // If email or token are missing (after Suspense has resolved searchParams)
  // show an error state within this component.
  if (!email || !token) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          {error || "A problem occurred. Required information (email or verification token) is missing from the URL. Please try the verification step again."}
        </p>
        <Link href="/signup/new" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            Restart Sign Up
        </Link>
      </div>
    );
  }


  return (
    <>
        <div className="mb-6 text-center">
            <p className="text-sm text-gray-500">Creating account for:</p>
            <p className="font-medium text-slate-700">{email}</p>
        </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 sr-only">
              First name
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="First name"
                disabled={isLoading}
                />
            </div>
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 sr-only">
              Last name
            </label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Last name (Optional)"
                disabled={isLoading}
                />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="password_signup" className="block text-sm font-medium text-gray-700 sr-only">
            New password
          </label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="password_signup"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="New password (min. 8 characters)"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 sr-only">
            Confirm password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Confirm new password"
              disabled={isLoading}
            />
             <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && !message && <p className="text-sm text-red-600 text-center">{error}</p>}
        {message && <p className="text-sm text-green-600 text-center">{message}</p>}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Setting Up Account...' : 'Get Started'}
          </button>
        </div>
      </form>
    </>
  );
}


export default function CompleteProfilePage() {
  return (
    <AuthLayout title="Complete Your Profile" welcomeTitle="One Last Step!" welcomeSubtitle="Tell us a bit about yourself.">
      <Suspense fallback={<div className="text-center py-10"><p className="text-slate-600">Loading profile form...</p></div>}>
        <CompleteProfileForm />
      </Suspense>
    </AuthLayout>
  );
}