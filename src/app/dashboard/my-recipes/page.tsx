"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { BookOpenIcon, PlusIcon } from "@heroicons/react/24/outline";


export default function MyRecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/session/new?callbackUrl=/dashboard/my-recipes");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return <div className="flex justify-center items-center min-h-screen"><p className="text-xl">Loading My Recipes...</p></div>;
  }

  const savedRecipes = [
    { id: 1, name: "AI Tomato Pasta Deluxe", dateSaved: "2023-10-20", cuisine: "Italian" },
    { id: 2, name: "Quick Vegan Curry Surprise", dateSaved: "2023-10-18", cuisine: "Indian" },
    { id: 3, name: "Leftover Chicken Stir-fry Magic", dateSaved: "2023-10-15", cuisine: "Asian" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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

        {savedRecipes.length === 0 ? (
          <div className="text-center bg-white shadow-lg rounded-lg p-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-900">No recipes saved yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by generating some recipes and save your favorites here!
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <ul role="list" className="divide-y divide-gray-200">
              {savedRecipes.map((recipe) => (
                <li key={recipe.id}>
                  <Link href={`/dashboard/my-recipes/${recipe.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-md font-medium text-orange-600 truncate">{recipe.name}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {recipe.cuisine}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Saved on: {recipe.dateSaved}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
         <div className="mt-8 text-center">
            <Link href="/dashboard" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                ← Back to Dashboard
            </Link>
        </div>
      </div>
    </div>
  );
}