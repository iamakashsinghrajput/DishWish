import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';
import { sendMail } from '@/lib/mailer';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const RESET_TOKEN_EXPIRATION_MINUTES = 30;

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
      console.warn(`Password reset requested for non-existent email: ${lowercasedEmail}`);
      return NextResponse.json({ message: 'If an account with this email exists, a password reset link has been sent.' }, { status: 200 });
    }

    if (!user.emailVerified) {
        return NextResponse.json({ message: 'Email not verified. Please verify your email first.' }, { status: 403 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = await bcrypt.hash(resetToken, 10);

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(lowercasedEmail)}`;

    try {
      await sendMail({
        to: lowercasedEmail,
        subject: 'DishWish Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your DishWish account. Please click the link below to set a new password:</p>
            <p><a href="${resetUrl}" style="color: #f97316; text-decoration: none; font-weight: bold;">Reset Your Password</a></p>
            <p>This link is valid for ${RESET_TOKEN_EXPIRATION_MINUTES} minutes.</p>
            <p>If you did not request a password reset, please ignore this email or contact support if you suspect suspicious activity.</p>
            <br>
            <p>Best regards,</p>
            <p>The DishWish Team</p>
          </div>
        `,
      });
      return NextResponse.json({ message: 'If an account with this email exists, a password reset link has been sent.' }, { status: 200 });
    } catch (emailError) {
      console.error("Password Reset Email sending error:", emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return NextResponse.json({ message: 'An error occurred while trying to send the reset link. Please try again later.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}