import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import RecipeModel from '@/models/Recipe';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathnameParts = url.pathname.split('/');
  const recipeId = pathnameParts[pathnameParts.length - 1];

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!recipeId || !mongoose.Types.ObjectId.isValid(recipeId)) {
    return NextResponse.json({ message: 'Invalid recipe ID format.' }, { status: 400 });
  }

  try {
    await dbConnect();

    const recipe = await RecipeModel.findById(recipeId);

    if (!recipe) {
      return NextResponse.json({ message: 'Recipe not found.' }, { status: 404 });
    }

    if (recipe.userId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'You do not have permission to view this recipe.' }, { status: 403 });
    }

    return NextResponse.json({ recipe }, { status: 200 });

  } catch (error) {
    console.error(`Failed to fetch recipe ${recipeId}:`, error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching the recipe.' }, { status: 500 });
  }
}
