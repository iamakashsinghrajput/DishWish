import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { firstName, lastName } = await request.json();

    if (typeof firstName !== 'string' || firstName.trim() === '') {
      return NextResponse.json({ message: 'First name is required' }, { status: 400 });
    }

    const user = await UserModel.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.firstName = firstName.trim();
    user.lastName = lastName?.trim() || undefined;

    await user.save();

    return NextResponse.json({ 
        message: 'Profile updated successfully',
        user: {
            id: user._id,
            name: `${user.firstName} ${user.lastName || ''}`.trim(),
            email: user.email,
            image: user.image,
        }
    }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while updating profile' }, { status: 500 });
  }
}