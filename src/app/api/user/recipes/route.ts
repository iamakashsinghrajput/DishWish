import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import RecipeModel from '@/models/Recipe';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const recipes = await RecipeModel.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select('_id name cuisine createdAt source tags');

    return NextResponse.json({ recipes }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch user recipes:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching recipes.' }, { status: 500 });
  }
}