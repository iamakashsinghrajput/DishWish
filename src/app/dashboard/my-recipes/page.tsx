"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpenIcon, PlusIcon, SparklesIcon, ChevronRightIcon} from "@heroicons/react/24/outline";
import { IRecipe } from "@/models/Recipe";

type RecipeListItem = Pick<IRecipe, '_id' | 'name' | 'cuisine' | 'createdAt' | 'source' | 'tags'>;

export default function MyRecipesPage() {
  const { status } = useSession();
  const router = useRouter();

  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/session/new?callbackUrl=/dashboard/my-recipes");
    }

    if (status === "authenticated") {
      const fetchRecipes = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/user/recipes');
          if (!response.ok) {
            throw new Error('Failed to fetch recipes. Please try again.');
          }
          const data = await response.json();
          setRecipes(data.recipes);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRecipes();
    }
  }, [status, router]);
  
  const RecipeSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-3/5"></div>
                    <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="mt-4 h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="bg-slate-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-tight text-slate-800 sm:truncate">
              My Saved Recipes
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              All your culinary creations and favorite AI-generated meals in one place.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/generate-recipe"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Generate New Recipe
            </Link>
          </div>
        </header>

        <main>
          {isLoading ? (
            <RecipeSkeleton />
          ) : error ? (
            <div className="text-center bg-red-50 text-red-700 p-8 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Oops! Something went wrong.</h3>
                <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center bg-white shadow-lg rounded-lg p-12 border border-dashed border-gray-300">
                <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-slate-900">Your Cookbook is Empty</h3>
                <p className="mt-2 text-sm text-gray-500">
                You haven&apos;t saved any recipes yet. Let&apos;s create your first one!
                </p>
                <div className="mt-6">
                    <Link href="/generate-recipe" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                        Generate a Recipe with AI
                    </Link>
                </div>
            </div>
          ) : (
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <ul role="list" className="divide-y divide-gray-200">
                {recipes.map((recipe) => (
                    <li key={recipe._id.toString()}>
                    <Link href={`/dashboard/my-recipes/${recipe._id.toString()}`} className="block hover:bg-slate-50 transition-colors duration-150">
                        <div className="px-4 py-5 sm:px-6">
                        <div className="flex items-center justify-between">
                            <p className="text-md font-medium text-orange-600 truncate group-hover:underline">
                                {recipe.name}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex items-center">
                                {recipe.source === 'ai' && (
                                    <span title="AI Generated" className="mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                                        <SparklesIcon className="h-3 w-3 mr-1 text-sky-600"/> AI
                                    </span>
                                )}
                                {recipe.cuisine && (
                                    <p className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {recipe.cuisine}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between items-center">
                            <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                                Saved on: {new Date(recipe.createdAt).toLocaleDateString()}
                            </p>
                            </div>
                            <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                                <ChevronRightIcon className="h-5 w-5 text-gray-400"/>
                            </div>
                        </div>
                        </div>
                    </Link>
                    </li>
                ))}
                </ul>
            </div>
          )}
        </main>

         <div className="mt-8 text-center">
            <Link href="/dashboard" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                ← Back to Dashboard Overview
            </Link>
        </div>
      </div>
    </div>
  );
}