/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  email: string;
  [key: string]: any;
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { token, firstName, lastName, password } = await request.json();

    if (!token || !firstName || !password) {
      return NextResponse.json({ message: 'Token, first name, and password are required' }, { status: 400 });
    }

    let decodedToken: DecodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as DecodedToken;
    } catch (err) {
        return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }

    const { userId, email } = decodedToken;

    const user = await UserModel.findById(userId) as any;

    if (!user || user.email !== email) {
      return NextResponse.json({ message: 'User not found or token mismatch.' }, { status: 404 });
    }

    if (user.emailVerified) {
        return NextResponse.json({ message: 'Profile already completed.' }, { status: 400 });
    }

    user.firstName = firstName;
    user.lastName = lastName || undefined;
    user.password = password;
    user.emailVerified = new Date();
    user.provider = 'email';

    await user.save();

    return NextResponse.json({ message: 'Registration completed successfully. Please login.' }, { status: 201 });

  } catch (error: any) {
    console.error('Complete registration error:', error);
    if (error.code === 11000) {
        return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
