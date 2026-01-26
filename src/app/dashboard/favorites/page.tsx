"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { HeartIcon } from "@heroicons/react/24/solid";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/session/new?callbackUrl=/dashboard/favorites");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-theme(space.32))]"><p className="text-xl">Loading Favorites...</p></div>;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">My Favorite Recipes</h1>
        <p className="mt-1 text-sm text-slate-600">
          All the recipes you&apos;ve marked as favorites.
        </p>
      </header>
      
      <div className="text-center bg-white shadow-lg rounded-lg p-12">
            <HeartIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-900">No favorites yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Explore recipes and mark your favorites to see them here!
            </p>
            <div className="mt-6">
            <Link
              href="/generate-recipe"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Find Recipes
            </Link>
          </div>
      </div>
      {/* You would list favorited recipes here, similar to MyRecipesPage */}
       <div className="mt-8">
            <Link href="/dashboard" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                ← Back to Overview
            </Link>
        </div>
    </div>
  );
}