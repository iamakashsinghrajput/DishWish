"use client";
import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 6, onComplete, disabled = false }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(new Array(length).fill(null));

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]!.focus();
    }

    const filledOtp = newOtp.join('');
    if (newOtp.every(char => char !== '')) {
      onComplete(filledOtp);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]!.focus();
    }
  };

  return (
    <div className="flex justify-center space-x-2 sm:space-x-3">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          name={`otp-${index}`}
          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-semibold border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all"
          maxLength={1}
          value={data}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          ref={(el) => { inputRefs.current[index] = el; }}
          disabled={disabled}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

export default OtpInput;