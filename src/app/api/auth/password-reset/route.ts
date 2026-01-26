import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json({ message: 'Token, email, and new password are required' }, { status: 400 });
    }

    if (password.length < 8) {
        return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const lowercasedEmail = email.toLowerCase();
    const user = await UserModel.findOne({
      email: lowercasedEmail,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user || !user.passwordResetToken) {
      return NextResponse.json({ message: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    const isTokenValid = await bcrypt.compare(token, user.passwordResetToken);
    if (!isTokenValid) {
        return NextResponse.json({ message: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    if (!user.emailVerified) { 
        user.emailVerified = new Date();
    }
    await user.save();

    // await sendMail({ to: user.email, subject: 'Your DishWish Password Has Been Changed', html: '...' });

    return NextResponse.json({ message: 'Password has been reset successfully. You can now login with your new password.' }, { status: 200 });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}