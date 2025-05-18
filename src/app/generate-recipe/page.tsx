/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { BeakerIcon, SparklesIcon, PlusCircleIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { IRecipe } from "@/models/Recipe";

export default function GenerateRecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [mealType, setMealType] = useState('');
  const [specificRequests, setSpecificRequests] = useState('');

  const [generatedRecipe, setGeneratedRecipe] = useState<Partial<IRecipe> | null>(null);
  const [rawAIResponse, setRawAIResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/session/new?callbackUrl=/generate-recipe");
    }
  }, [status, router]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleDietaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setDietaryRestrictions([...dietaryRestrictions, value]);
    } else {
      setDietaryRestrictions(dietaryRestrictions.filter(diet => diet !== value));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);
    setRawAIResponse(null);

    try {
      const response = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredients.filter(i => i.trim() !== ''),
          dietaryRestrictions,
          cuisine,
          skillLevel,
          mealType,
          specificRequests
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate recipe. Please try again.');
      }
      
      setGeneratedRecipe(data.recipe);
      setRawAIResponse(data.rawAIResponse);
      
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the recipe.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setGeneratedRecipe(null);
    setRawAIResponse(null);
    // setIngredients(['']); 
    // setDietaryRestrictions([]);
    // ... etc.
  }

  if (status === "loading") {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
            <p className="mt-4 text-xl font-semibold text-slate-700">Loading Recipe Generator...</p>
        </div>
    );
  }
  
  if (status === "unauthenticated" || !session) {
    return <div className="flex justify-center items-center min-h-screen"><p className="text-xl">Redirecting to login...</p></div>;
  }


  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SparklesIcon className="mx-auto h-12 w-12 text-orange-500" />
          <h1 className="mt-2 text-4xl font-extrabold text-slate-800 sm:text-5xl">
            Generate Your Next Meal
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Tell us what you have and what you like, and let our AI chef whip up something amazing for you!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 sm:p-10 space-y-8">
          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-2">Ingredients You Have:</label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  placeholder={`Ingredient ${index + 1} (e.g., chicken breast, tomatoes)`}
                  className="block w-full shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 border-gray-300 rounded-md"
                />
                {ingredients.length > 1 && (
                  <button type="button" onClick={() => handleRemoveIngredient(index)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddIngredient}
              className="mt-2 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
              Add Ingredient
            </button>
          </div>

          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-3">Dietary Restrictions (Optional):</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
              {['Vegetarian', 'Vegan', 'Gluten-Free', 'Nut-Free', 'Low-Carb', 'Keto'].map(diet => (
                <label key={diet} className="flex items-center space-x-2.5 cursor-pointer group">
                  <input type="checkbox" value={diet} onChange={handleDietaryChange} className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-offset-1"/>
                  <span className="text-slate-700 group-hover:text-orange-600 transition-colors text-sm">{diet}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
            <div>
              <label htmlFor="cuisine" className="block text-lg font-semibold text-slate-700 mb-2">Preferred Cuisine (Optional):</label>
              <input
                type="text"
                id="cuisine"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="e.g., Italian, Mexican, Indian"
                className="block w-full shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="skillLevel" className="block text-lg font-semibold text-slate-700 mb-2">Your Cooking Skill Level:</label>
              <select
                id="skillLevel"
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="block w-full shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border-gray-300 rounded-md bg-white"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label htmlFor="mealType" className="block text-lg font-semibold text-slate-700 mb-2">Meal Type (Optional):</label>
              <select
                id="mealType"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="block w-full shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border-gray-300 rounded-md bg-white"
              >
                <option value="">Any</option>
                <option>Breakfast</option>
                <option>Brunch</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snack</option>
                <option>Dessert</option>
                <option>Appetizer</option>
              </select>
            </div>
          </div>
          
          <div>
              <label htmlFor="specificRequests" className="block text-lg font-semibold text-slate-700 mb-2">Other Specific Requests (Optional):</label>
              <textarea
                id="specificRequests"
                value={specificRequests}
                onChange={(e) => setSpecificRequests(e.target.value)}
                rows={3}
                placeholder="e.g., make it spicy, low-sodium, use only one pot, kid-friendly, quick (under 30 mins), etc."
                className="block w-full shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 border-gray-300 rounded-md"
              />
          </div>


          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60 transition-all duration-150 ease-in-out"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Your Masterpiece...
                </>
              ) : (
                <>
                  <BeakerIcon className="h-6 w-6 mr-2.5" />
                  Generate Recipe
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
            <div className="mt-8 bg-red-50 p-4 rounded-md text-center">
                <p className="text-sm font-medium text-red-700">{error}</p>
                <button 
                    onClick={handleTryAgain}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <ArrowPathIcon className="h-4 w-4 mr-1.5"/> Try Again
                </button>
            </div>
        )}
        
        {generatedRecipe && !error && (
          <div className="mt-12 bg-white shadow-xl rounded-lg p-6 sm:p-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{generatedRecipe.name || "Your AI Recipe"}</h2>
            {generatedRecipe.description && <p className="text-slate-600 mb-6 text-md">{generatedRecipe.description}</p>}
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm text-slate-700">
                {generatedRecipe.prepTime && <div><strong>Prep:</strong> {generatedRecipe.prepTime}</div>}
                {generatedRecipe.cookTime && <div><strong>Cook:</strong> {generatedRecipe.cookTime}</div>}
                {generatedRecipe.servings && <div><strong>Servings:</strong> {generatedRecipe.servings}</div>}
                {generatedRecipe.cuisine && <div><strong>Cuisine:</strong> {generatedRecipe.cuisine}</div>}
            </div>

            {generatedRecipe.ingredients && generatedRecipe.ingredients.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-slate-700 mb-3">Ingredients:</h3>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                        {generatedRecipe.ingredients.map((ing, index) => (
                            <li key={index}>{`${ing.quantity || ''} ${ing.unit || ''} ${ing.item}`.trim()}</li>
                        ))}
                    </ul>
                </div>
            )}

            {generatedRecipe.instructions && generatedRecipe.instructions.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-slate-700 mb-3">Instructions:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-600">
                        {generatedRecipe.instructions.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>
            )}
            
            {generatedRecipe.notes && (
                <div className="p-4 bg-sky-50 rounded-md text-sky-700">
                    <h4 className="font-semibold mb-1">Chef&apos;s Notes:</h4>
                    <p className="text-sm whitespace-pre-line">{generatedRecipe.notes}</p>
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end">
                {generatedRecipe._id ? (
                    <Link href={`/dashboard/my-recipes/${generatedRecipe._id}`} className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                        View Saved Recipe
                    </Link>
                ) : (
                    <p className="text-sm text-slate-500">Recipe generated (not yet saved to your cookbook by default - implement save functionality).</p>
                )}
                 <button 
                    onClick={handleTryAgain}
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50"
                >
                    <SparklesIcon className="h-4 w-4 mr-1.5"/> Generate Another
                </button>
            </div>


            {rawAIResponse && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-500">Raw AI Output (for debugging):</h4>
                <pre className="mt-1 text-xs bg-gray-100 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                  {rawAIResponse}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}