/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/session/new/page.tsx
"use client";

import Link from 'next/link';
import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import AuthLayout from '@/components/auth/AuthLayout';
import SocialLogins from '@/components/auth/SocialLogins';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import OtpInput from '@/components/auth/OtpInput';

type LoginMode = 'password' | 'otp_request' | 'otp_verify';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const initialEmailForOtp = searchParams.get('email');
  const initialMode = searchParams.get('mode') as LoginMode | null;
  const initialError = searchParams.get('error');

  const [email, setEmail] = useState(initialEmailForOtp || '');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ? 'Authentication failed. Please check your credentials or try another method.' : null);
  const [message, setMessage] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<LoginMode>(initialMode && initialEmailForOtp ? initialMode : 'password');
  
  const [otpTimeLeft, setOtpTimeLeft] = useState(10 * 60 * 1000);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);

  useEffect(() => {
    if (initialMode && initialEmailForOtp) {
        setLoginMode(initialMode);
        setEmail(initialEmailForOtp);
    }
  }, [initialMode, initialEmailForOtp]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loginMode === 'otp_verify') {
        timer = setInterval(() => {
            setOtpTimeLeft((prevTime) => {
                if (prevTime <= 1000) {
                clearInterval(timer);
                setCanResendOtp(true);
                return 0;
                }
                return prevTime - 1000;
            });
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [loginMode]);

  useEffect(() => {
    let cooldownTimer: NodeJS.Timeout;
    if (otpResendCooldown > 0) {
      cooldownTimer = setTimeout(() => setOtpResendCooldown(otpResendCooldown - 1), 1000);
    } else if (loginMode === 'otp_verify' || timeLeftForOtpRequestButton() === 0) {
      setCanResendOtp(true);
    }
    return () => clearTimeout(cooldownTimer);
  }, [otpResendCooldown, loginMode]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const timeLeftForOtpRequestButton = () => {
      if(loginMode === 'otp_verify') return otpTimeLeft;
      return 0; // For password mode or otp_request, resend is immediate if not on cooldown
  }


  const handlePasswordLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      loginType: 'password',
    });

    setIsLoading(false);
    if (result?.error) {
      setError(result.error === "CredentialsSignin" ? "Invalid email or password." : result.error);
    } else if (result?.ok) {
      router.push(callbackUrl);
    } else {
        setError("Login failed. Please try again.");
    }
  };

  const handleOtpRequest = async (e?: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if(e) e.preventDefault();
    if (!email) {
        setError("Please enter your email address.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setCanResendOtp(false);
    setOtpResendCooldown(60);

    try {
        const res = await fetch('/api/auth/login-request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
            setError(data.message || 'Failed to send OTP.');
            setCanResendOtp(true);
        } else {
            setMessage(data.message || 'OTP sent successfully!');
            setLoginMode('otp_verify');
            setOtpTimeLeft(10 * 60 * 1000);
            router.replace(`/session/new?email=${encodeURIComponent(email)}&mode=otp_verify&callbackUrl=${encodeURIComponent(callbackUrl)}`, { scroll: false });
        }
    } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        setCanResendOtp(true);
    } finally {
        setIsLoading(false);
    }
  };

  const handleOtpLogin = async (e?: FormEvent<HTMLFormElement>) => {
    if(e) e.preventDefault();
     if (otp.length !== 6) {
        setError("Please enter the complete 6-digit OTP.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      otp,
      loginType: 'otp',
    });

    setIsLoading(false);
    if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid or expired OTP." : result.error);
    } else if (result?.ok) {
      router.push(callbackUrl);
    } else {
        setError("Login failed. Please try again.");
    }
  };
  
  const switchMode = (newMode: LoginMode) => {
    setLoginMode(newMode);
    setError(null);
    setMessage(null);
    setOtp(''); // Clear OTP when switching modes
    if (newMode === 'password') {
        // Clear email from URL if switching back to password from OTP flow initiated by query param
        router.replace(`/session/new?callbackUrl=${encodeURIComponent(callbackUrl)}`, { scroll: false });
    }
  };

  const maskedEmailForOtp = email ? `${email.substring(0, Math.min(2, email.indexOf('@')))}****@${email.split('@')[1]}` : 'your email';

  return (
    <>
      <SocialLogins orText={loginMode === 'password' ? "OR Sign in with Email" : undefined} />
      
      {error && <p className="my-4 text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">{error}</p>}
      {message && <p className="my-4 text-sm text-green-600 text-center bg-green-50 p-3 rounded-md">{message}</p>}

      {loginMode === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-6">
          <div>
            <label htmlFor="email_login_pass" className="block text-sm font-medium text-gray-700 sr-only">Email</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input id="email_login_pass" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="you@example.com" disabled={isLoading} />
            </div>
          </div>
          <div>
            <label htmlFor="password_login" className="block text-sm font-medium text-gray-700 sr-only">Password</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input id="password_login" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Password" disabled={isLoading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-orange-600 hover:text-orange-500">
                Forgot Password?
              </Link>
            </div>
          </div>
          <div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
            <div className="mt-6 text-center">
                <button type="button" onClick={() => switchMode('otp_request')} className="font-medium text-orange-600 hover:text-orange-500 text-sm">
                    Sign in with OTP instead
                </button>
            </div>
        </form>
      )}

      {loginMode === 'otp_request' && (
         <form onSubmit={handleOtpRequest} className="space-y-6">
            <p className="text-sm text-center text-gray-500">Enter your email to receive a One-Time Password.</p>
            <div>
                <label htmlFor="email_login_otp_req" className="block text-sm font-medium text-gray-700 sr-only">Email for OTP</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="email_login_otp_req" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Enter your email for OTP" disabled={isLoading} />
                </div>
            </div>
            <div>
                <button type="submit" disabled={isLoading || otpResendCooldown > 0} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50">
                <PaperAirplaneIcon className="h-5 w-5 mr-2 transform -rotate-45" /> 
                {isLoading ? 'Sending OTP...' : (otpResendCooldown > 0 ? `Resend OTP in ${otpResendCooldown}s` : 'Send OTP')}
                </button>
            </div>
             <div className="mt-6 text-center">
                <button type="button" onClick={() => switchMode('password')} className="font-medium text-orange-600 hover:text-orange-500 text-sm">
                    Sign in with Password instead
                </button>
            </div>
        </form>
      )}

      {loginMode === 'otp_verify' && (
        <>
            <p className="text-center text-slate-600 my-4 text-sm">
                An OTP has been sent to {maskedEmailForOtp}. Valid for {formatTime(otpTimeLeft)}.
            </p>
            <form onSubmit={handleOtpLogin} className="space-y-6">
                <OtpInput length={6} onComplete={(completedOtp) => setOtp(completedOtp)} disabled={isLoading} />
                <div>
                    <button type="submit" disabled={isLoading || otp.length < 6} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                    {isLoading ? 'Verifying OTP...' : 'Sign in with OTP'}
                    </button>
                </div>
            </form>
            <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">Didn&apos;t receive the code?{' '}
                {(otpTimeLeft === 0 || (canResendOtp && otpResendCooldown === 0)) ? (
                    <button onClick={() => handleOtpRequest()} disabled={isLoading} className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400">
                    Resend OTP
                    </button>
                ) : (
                    <span className="text-gray-500">
                        Resend in {otpResendCooldown > 0 ? `${otpResendCooldown}s` : formatTime(otpTimeLeft)}
                    </span>
                )}
                </p>
            </div>
            <div className="mt-6 text-center">
                <button type="button" onClick={() => switchMode('password')} className="font-medium text-orange-600 hover:text-orange-500 text-sm">
                    Sign in with Password instead
                </button>
            </div>
        </>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/signup/new" className="font-medium text-orange-600 hover:text-orange-500">
          Sign up
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout title="Sign in to DishWish" welcomeSubtitle="Welcome back! Access your culinary creations.">
      <Suspense fallback={<div className="text-center py-10"><p className="text-slate-600">Loading login options...</p></div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}