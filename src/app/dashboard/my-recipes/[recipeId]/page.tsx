"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  PrinterIcon,
  ShareIcon,
  StarIcon as StarOutlineIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon, FireIcon as FireSolidIcon } from "@heroicons/react/24/solid";
import { IRecipe } from "@/models/Recipe";

export default function RecipeDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  
  const recipeId = Array.isArray(params?.recipeId) ? params.recipeId[0] : params?.recipeId;

  const [recipe, setRecipe] = useState<IRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" && recipeId) {
      router.replace(`/session/new?callbackUrl=/dashboard/my-recipes/${recipeId}`);
    }

    if (status === "authenticated" && recipeId) {
      setIsLoading(true);
      setError(null);
      
      fetch(`/api/recipes/${recipeId}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || 'Failed to fetch the recipe.');
          }
          setRecipe(data.recipe);
        })
        .catch((err: Error) => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (status === 'authenticated' && !recipeId) {
      setError("Recipe ID is missing from the URL.");
      setIsLoading(false);
    }
  }, [recipeId, status, router]);

  const toggleFavorite = async () => {
    if (!recipe) return;
    console.warn("Toggling favorite status (API endpoint at /api/recipes/[recipeId]/favorite needs implementation)");
    setRecipe(prev => prev ? ({ ...prev, isFavorite: !prev.isFavorite } as IRecipe) : null);
  };

  if (status === "loading" || (isLoading && !error)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
          <p className="mt-4 text-xl font-semibold text-slate-700">Loading Recipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
        <p className="text-slate-600 mt-2 mb-6">{error}</p>
        <Link href="/dashboard/my-recipes" className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to My Recipes
        </Link>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex justify-center items-center min-h-screen text-center p-4">
        <p className="text-xl">Recipe could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard/my-recipes" className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to My Recipes
          </Link>
        </div>

        <article className="bg-white p-6 sm:p-10 rounded-lg shadow-xl">
          <header className="mb-8 border-b border-gray-200 pb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {recipe.source === 'ai' && (
                  <div className="inline-flex items-center bg-sky-100 text-sky-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    <SparklesIcon className="h-4 w-4 mr-1.5" />
                    AI Generated
                  </div>
                )}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                  {recipe.name}
                </h1>
              </div>
              <button onClick={toggleFavorite} className="p-2 ml-4 text-gray-400 hover:text-orange-500 transition-colors flex-shrink-0">
                {recipe.isFavorite ? <StarSolidIcon className="h-7 w-7 text-yellow-400" /> : <StarOutlineIcon className="h-7 w-7" />}
                <span className="sr-only">{recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
              </button>
            </div>

            {recipe.description && <p className="mt-3 text-lg text-slate-600 max-w-3xl">{recipe.description}</p>}

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 text-center">
              {(recipe.prepTime || recipe.cookTime) && (
                <div className="flex flex-col items-center">
                  <ClockIcon className="h-7 w-7 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">Prep: {recipe.prepTime || 'N/A'}</span>
                  <span className="text-sm text-slate-500">Cook: {recipe.cookTime || 'N/A'}</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex flex-col items-center">
                  <UsersIcon className="h-7 w-7 text-slate-400 mb-2" />
                  <span className="font-semibold text-slate-700">{recipe.servings}</span>
                  <span className="text-sm text-slate-500">Servings</span>
                </div>
              )}
              {recipe.totalCalories && (
                <div className="flex flex-col items-center">
                  <FireSolidIcon className="h-7 w-7 text-red-400 mb-2" />
                  <span className="font-semibold text-slate-700">~{recipe.totalCalories.toLocaleString()}</span>
                  <span className="text-sm text-slate-500">kcal (Total)</span>
                </div>
              )}
            </div>
          </header>

          <div className="lg:grid lg:grid-cols-3 lg:gap-12">
            <section className="lg:col-span-1 mb-10 lg:mb-0">
              <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Ingredients</h2>
              <ul className="space-y-3 text-slate-700">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 font-bold mr-2 mt-0.5">›</span>
                    <span>
                      <strong>{ing.quantity || ''} {ing.unit || ''}</strong> {ing.item}
                      {ing.notes && <em className="text-xs text-slate-500 block"> ({ing.notes})</em>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Instructions</h2>
              <ol className="space-y-6 text-slate-700 leading-relaxed">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="bg-orange-500 text-white rounded-full h-8 w-8 min-w-[32px] text-lg flex items-center justify-center mr-4 font-bold">{index + 1}</span>
                    <p className="pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {recipe.notes && (
            <footer className="mt-10 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Chef&apos;s Notes</h2>
              <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-4 rounded-md">
                <p>{recipe.notes}</p>
              </div>
            </footer>
          )}

          <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row justify-end items-center gap-4">
            <div className="flex space-x-3">
              <button onClick={() => window.print()} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <PrinterIcon className="h-5 w-5 mr-2 text-gray-400" /> Print
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <ShareIcon className="h-5 w-5 mr-2 text-gray-400" /> Share
              </button>
            </div>
          </div>

        </article>
      </div>
    </div>
  );
}