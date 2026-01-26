"use client";
import { KeyIcon } from "@heroicons/react/16/solid";
import { signIn } from "next-auth/react";
import { FaApple, FaMicrosoft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function SocialLogins({ orText = "OR" }: { orText?: string }) {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <>
      <div className="flex items-center justify-center space-x-3 my-6">
        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Sign in with Google"
        >
          <FcGoogle className="w-6 h-6" />
        </button>
        <button
          type="button"
          className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Sign in with Microsoft"
        >
          <FaMicrosoft className="w-6 h-6 text-[#00A4EF]" />
        </button>
        <button
          type="button"
          className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Sign in with Apple"
        >
          <FaApple className="w-6 h-6 text-black" />
        </button>
        <button
          type="button"
          className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Sign in with SSO"
        >
          <KeyIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      {orText && (
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{orText}</span>
          </div>
        </div>
      )}
    </>
  );
}