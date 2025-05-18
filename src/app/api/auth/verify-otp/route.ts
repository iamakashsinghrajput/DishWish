import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    const lowercasedEmail = email.toLowerCase();
    const user = await UserModel.findOne({ email: lowercasedEmail });

    if (!user) {
      return NextResponse.json({ message: 'User not found. Please start registration again.' }, { status: 404 });
    }

    if (!user.otp || !user.otpExpires) {
        return NextResponse.json({ message: 'No OTP found for this user or OTP already used.' }, { status: 400 });
    }

    if (new Date() > user.otpExpires) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return NextResponse.json({ message: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);

    if (!isOtpValid) {
      return NextResponse.json({ message: 'Invalid OTP.' }, { status: 400 });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const profileSetupToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: '15m' }
    );

    return NextResponse.json({ message: 'OTP verified successfully. Proceed to complete your profile.', token: profileSetupToken }, { status: 200 });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}