/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeftIcon, PrinterIcon, ShareIcon, StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: { item: string; quantity: string }[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  cuisine?: string;
  notes?: string;
  imageUrl?: string;
  isFavorite?: boolean;
}

async function fetchRecipeById(recipeId: string): Promise<Recipe | null> {
  // const response = await fetch(`/api/recipes/${recipeId}`);
  // if (!response.ok) return null;
  // return response.json();

  if (recipeId === "1") {
    return {
      id: "1",
      name: "AI Tomato Pasta Deluxe",
      description: "A rich and flavorful tomato pasta dish, enhanced by AI suggestions for a perfect balance of herbs and spices.",
      ingredients: [
        { item: "Pasta (Spaghetti or Penne)", quantity: "400g" },
        { item: "Canned Chopped Tomatoes", quantity: "2 cans (800g total)" },
        { item: "Onion, chopped", quantity: "1 medium" },
        { item: "Garlic, minced", quantity: "3 cloves" },
        { item: "Olive Oil", quantity: "2 tbsp" },
        { item: "Dried Oregano", quantity: "1 tsp" },
        { item: "Dried Basil", quantity: "1 tsp" },
        { item: "Red Pepper Flakes (optional)", quantity: "1/4 tsp" },
        { item: "Salt and Black Pepper", quantity: "to taste" },
        { item: "Fresh Basil or Parsley, chopped", quantity: "for garnish" },
        { item: "Parmesan Cheese, grated (optional)", quantity: "for serving" },
      ],
      instructions: [
        "Cook pasta according to package directions. Drain and set aside.",
        "While pasta cooks, heat olive oil in a large pan or Dutch oven over medium heat. Add chopped onion and cook until softened, about 5-7 minutes.",
        "Add minced garlic and red pepper flakes (if using) and cook for another minute until fragrant.",
        "Pour in the canned chopped tomatoes. Stir in dried oregano and dried basil. Season with salt and pepper.",
        "Bring the sauce to a simmer, then reduce heat to low, cover, and let it cook for at least 15-20 minutes, stirring occasionally, to allow flavors to meld.",
        "Taste the sauce and adjust seasonings if necessary.",
        "Add the cooked pasta to the sauce and toss to combine well.",
        "Serve immediately, garnished with fresh basil or parsley and grated Parmesan cheese, if desired.",
      ],
      prepTime: "15 minutes",
      cookTime: "30 minutes",
      servings: 4,
      cuisine: "Italian",
      isFavorite: true,
    };
  }
  if (recipeId === "2") {
    return {
        id: "2",
        name: "Quick Vegan Curry Surprise",
        description: "A surprisingly flavorful and quick vegan curry, perfect for a weeknight meal. The AI helps balance the spices for an authentic taste.",
        ingredients: [
            { item: "Coconut Oil", quantity: "1 tbsp" },
            { item: "Onion, chopped", quantity: "1 medium" },
            { item: "Garlic, minced", quantity: "2 cloves" },
            { item: "Ginger, grated", quantity: "1 inch piece" },
            { item: "Mixed Vegetables (e.g., carrots, peas, bell peppers, broccoli)", quantity: "4 cups, chopped" },
            { item: "Chickpeas, drained and rinsed", quantity: "1 can (15 oz)" },
            { item: "Full-fat Coconut Milk", quantity: "1 can (13.5 oz)" },
            { item: "Vegetable Broth", quantity: "1/2 cup" },
            { item: "Curry Powder", quantity: "2 tbsp" },
            { item: "Turmeric Powder", quantity: "1 tsp" },
            { item: "Cumin Powder", quantity: "1 tsp" },
            { item: "Cayenne Pepper (optional)", quantity: "1/4 tsp" },
            { item: "Salt and Black Pepper", quantity: "to taste" },
            { item: "Fresh Cilantro, chopped", quantity: "for garnish" },
            { item: "Cooked Rice or Naan", quantity: "for serving" },
        ],
        instructions: [
            "Heat coconut oil in a large pot or Dutch oven over medium heat. Add onion and cook until softened, about 5 minutes.",
            "Add garlic and ginger, and cook for 1 minute more until fragrant.",
            "Stir in curry powder, turmeric, cumin, and cayenne pepper (if using). Cook for 1 minute, stirring constantly, until spices are toasted.",
            "Add the mixed vegetables and chickpeas. Stir to coat with the spices.",
            "Pour in the coconut milk and vegetable broth. Bring to a simmer.",
            "Reduce heat to low, cover, and cook for 10-15 minutes, or until vegetables are tender.",
            "Season with salt and pepper to taste.",
            "Serve hot over cooked rice or with naan bread, garnished with fresh cilantro.",
        ],
        prepTime: "10 minutes",
        cookTime: "20 minutes",
        servings: 4,
        cuisine: "Indian",
        isFavorite: false,
    };
  }
  return null;
}


export default function RecipeDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const recipeId = params.recipeId as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/session/new?callbackUrl=/dashboard/my-recipes/${recipeId}`);
    }
  }, [status, router, recipeId]);

  useEffect(() => {
    if (recipeId && status === "authenticated") {
      setIsLoading(true);
      fetchRecipeById(recipeId)
        .then((data) => {
          if (data) {
            setRecipe(data);
          } else {
            setError("Recipe not found or you do not have permission to view it.");
          }
        })
        .catch(() => setError("Failed to load recipe details."))
        .finally(() => setIsLoading(false));
    }
  }, [recipeId, status]);

  const toggleFavorite = async () => {
    if (!recipe) return;
    // const newFavStatus = !recipe.isFavorite;
    // await fetch(`/api/recipes/${recipe.id}/favorite`, { method: 'PUT', body: JSON.stringify({ isFavorite: newFavStatus }) });
    setRecipe({ ...recipe, isFavorite: !recipe.isFavorite });
  };


  if (status === "loading" || isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p className="text-xl">Loading Recipe Details...</p></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <Link href="/dashboard/my-recipes" className="text-orange-600 hover:text-orange-500 font-medium">
          ← Back to My Recipes
        </Link>
      </div>
    );
  }

  if (!recipe) {
    return <div className="flex justify-center items-center min-h-screen"><p className="text-xl">Recipe not found.</p></div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <Link href="/dashboard/my-recipes" className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500">
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Back to My Recipes
            </Link>
        </div>

        <article className="bg-white shadow-xl rounded-lg overflow-hidden">
          {recipe.imageUrl && (
            <div className="h-64 sm:h-80 md:h-96 w-full relative">
                <Image src={recipe.imageUrl} alt={recipe.name} className="object-cover w-full h-full" />
            </div>
          )}
          <div className="p-6 sm:p-10">
            <header className="mb-8">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight">
                  {recipe.name}
                </h1>
                <button onClick={toggleFavorite} className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
                    {recipe.isFavorite ? <StarSolidIcon className="h-7 w-7 text-yellow-400" /> : <StarOutlineIcon className="h-7 w-7" />}
                    <span className="sr-only">{recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                </button>
              </div>
              {recipe.description && <p className="mt-3 text-lg text-slate-600">{recipe.description}</p>}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                {recipe.prepTime && <span>Prep Time: <strong>{recipe.prepTime}</strong></span>}
                {recipe.cookTime && <span>Cook Time: <strong>{recipe.cookTime}</strong></span>}
                {recipe.servings && <span>Servings: <strong>{recipe.servings}</strong></span>}
                {recipe.cuisine && <span>Cuisine: <strong>{recipe.cuisine}</strong></span>}
              </div>
            </header>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">Ingredients</h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index}>
                    <strong>{ing.quantity}</strong> {ing.item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">Instructions</h2>
              <ol className="list-decimal list-inside space-y-3 text-slate-700 leading-relaxed">
                {recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </section>

            {recipe.notes && (
              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-slate-700 mb-4">Chef&apos;s Notes</h2>
                <p className="text-slate-600 whitespace-pre-line">{recipe.notes}</p>
              </section>
            )}

            <footer className="mt-12 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500">Generated by DishWish AI</p>
                <div className="flex space-x-3">
                    <button onClick={() => window.print()} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <PrinterIcon className="h-5 w-5 mr-2 text-gray-400" /> Print
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <ShareIcon className="h-5 w-5 mr-2 text-gray-400" /> Share
                    </button>
                </div>
            </footer>
          </div>
        </article>
      </div>
    </div>
  );
}