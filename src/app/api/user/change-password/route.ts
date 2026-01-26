import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Ensure this is for users who signed up with a password
  if (session.user.provider !== 'credentials' && session.user.provider !== 'email') {
    return NextResponse.json({ message: 'Password management is not available for social logins.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Current and new passwords are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    const user = await UserModel.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json({ message: 'No password set for this account.' }, { status: 400 });
    }

    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Incorrect current password.' }, { status: 403 });
    }

    // The 'save' pre-hook in User.ts will automatically hash the new password
    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while changing the password' }, { status: 500 });
  }
}