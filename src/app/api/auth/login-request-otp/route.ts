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
    const user = await UserModel.findOne({ email: lowercasedEmail });

    if (!user) {
      return NextResponse.json({ message: 'No account found with this email.' }, { status: 404 });
    }
    if (!user.emailVerified) {
        return NextResponse.json({ message: 'Email not verified. Please verify your email first or complete registration.' }, { status: 403 });
    }
    // if (user.provider !== 'email' && user.provider !== 'credentials' && !user.password) { // Or just check if password exists
    //   return NextResponse.json({ message: 'OTP login is not available for accounts created with social providers unless a password is set.' }, { status: 400 });
    // }


    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpires = otpExpires;
    await user.save();

    try {
      await sendMail({
        to: lowercasedEmail,
        subject: 'Your DishWish Login OTP',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>DishWish Login</h2>
            <p>Your One-Time Password (OTP) for logging into DishWish is:</p>
            <p style="font-size: 24px; font-weight: bold; color: #f97316;">${otp}</p>
            <p>This OTP is valid for ${OTP_EXPIRATION_MINUTES} minutes.</p>
            <p>If you did not request this, please ignore this email or contact support if you suspect suspicious activity.</p>
            <br>
            <p>Best regards,</p>
            <p>The DishWish Team</p>
          </div>
        `,
      });
      return NextResponse.json({ message: 'OTP sent to your email. Please use it to login.' }, { status: 200 });
    } catch (emailError) {
      console.error("Login OTP Email sending error:", emailError);
      return NextResponse.json({ message: 'OTP generated, but failed to send email. Please try resending or contact support.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Login request OTP error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}