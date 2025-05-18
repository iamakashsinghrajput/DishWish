import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';
import { sendMail } from '@/lib/mailer';
import { generateOTP, OTP_EXPIRATION_MINUTES } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { email } = await request.json();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 400 });
    }

    const lowercasedEmail = email.toLowerCase();
    const existingUser = await UserModel.findOne({ email: lowercasedEmail });

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json({ message: 'Email already registered and verified. Please login.' }, { status: 409 });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
    const hashedOtp = await bcrypt.hash(otp, 10);

    if (existingUser) {
      existingUser.otp = hashedOtp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
    } else {
      await UserModel.create({
        email: lowercasedEmail,
        otp: hashedOtp,
        otpExpires: otpExpires,
        provider: 'email',
      });
    }

    try {
      await sendMail({
        to: lowercasedEmail,
        subject: 'Verify Your Email for DishWish',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Welcome to DishWish!</h2>
            <p>Thank you for signing up. Please use the following OTP to verify your email address:</p>
            <p style="font-size: 24px; font-weight: bold; color: #f97316;">${otp}</p>
            <p>This OTP is valid for ${OTP_EXPIRATION_MINUTES} minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p>The DishWish Team</p>
          </div>
        `,
      });
      return NextResponse.json({ message: 'OTP sent to your email. Please verify to continue.' }, { status: 200 });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json({ message: 'OTP generated, but failed to send email. Please try resending or contact support.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Register request error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}