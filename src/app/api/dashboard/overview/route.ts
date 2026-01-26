import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import RecipeModel from '@/models/Recipe';
import mongoose from 'mongoose';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [stats, recentRecipes] = await Promise.all([
      RecipeModel.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            totalRecipes: { $sum: 1 },
            aiGenerated: {
              $sum: { $cond: [{ $eq: ['$source', 'ai'] }, 1, 0] }
            },
            favorites: {
              $sum: { $cond: ['$isFavorite', 1, 0] }
            },
            thisMonthGenerated: {
              $sum: {
                $cond: [{ $gte: ['$createdAt', startOfMonth] }, 1, 0]
              }
            }
          }
        }
      ]),
      RecipeModel.find({ userId: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('_id name cuisine createdAt source')
    ]);

    const dashboardStats = stats[0] || {
      totalRecipes: 0,
      aiGenerated: 0,
      favorites: 0,
      thisMonthGenerated: 0,
    };
    delete dashboardStats._id;

    return NextResponse.json({
      stats: dashboardStats,
      recentRecipes
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching dashboard data.' }, { status: 500 });
  }
}