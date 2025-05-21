"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { BeakerIcon, SparklesIcon, PlusCircleIcon, TrashIcon, ArrowPathIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
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
  const [showRawOutputToggle, setShowRawOutputToggle] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/session/new?callbackUrl=/generate-recipe");
    }
  }, [status, router]);

  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };
  const handleRemoveIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));
  const handleDietaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setDietaryRestrictions(prev => checked ? [...prev, value] : prev.filter(diet => diet !== value));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);
    setRawAIResponse(null);
    setShowRawOutputToggle(false);

    try {
      const response = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredients.filter(i => i.trim() !== ''),
          dietaryRestrictions, cuisine, skillLevel, mealType, specificRequests
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to generate recipe.');
      setGeneratedRecipe(data.recipe);
      setRawAIResponse(data.rawAIResponse);
      
      const recipeIsPoorlyParsed = data.recipe && (!data.recipe.name || data.recipe.name === "AI Generated Recipe (Parsing Pending)" || data.recipe.name === "Untitled AI Recipe" || !data.recipe.instructions || data.recipe.instructions.length === 0);
      if (recipeIsPoorlyParsed) {
        setShowRawOutputToggle(true);
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgainOrNew = () => {
    setError(null);
    setGeneratedRecipe(null);
    setRawAIResponse(null);
    setShowRawOutputToggle(false);
  };

  if (status === "loading") return <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div><p className="mt-4 text-xl font-semibold text-slate-700">Loading...</p></div>;
  if (status === "unauthenticated" || !session) return <div className="flex justify-center items-center min-h-screen"><p className="text-xl">Redirecting...</p></div>;

  const isRecipeConsideredParsed = generatedRecipe && 
                                (generatedRecipe.name && generatedRecipe.name !== "AI Generated Recipe (Parsing Pending)" && generatedRecipe.name !== "Untitled AI Recipe") && 
                                (generatedRecipe.instructions && generatedRecipe.instructions.length > 0) &&
                                (generatedRecipe.ingredients && generatedRecipe.ingredients.length > 0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const displayTitle = isLoading ? "Generating Your Recipe..." : 
                       error ? "Error Generating Recipe" : 
                       generatedRecipe?.name && generatedRecipe.name !== "AI Generated Recipe (Parsing Pending)" && generatedRecipe.name !== "Untitled AI Recipe" ? generatedRecipe.name : 
                       "AI Generated Recipe";

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {(!generatedRecipe && !isLoading && !error) && (
          <>
            <div className="text-center mb-12">
              <SparklesIcon className="mx-auto h-12 w-12 text-orange-500" />
              <h1 className="mt-2 text-4xl font-extrabold text-slate-800 sm:text-5xl">Generate Your Next Meal</h1>
              <p className="mt-4 text-lg text-slate-600">Tell us your preferences, and let our AI chef inspire you!</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 sm:p-10 space-y-8">
              <div><label className="block text-lg font-semibold text-slate-700 mb-2">Ingredients You Have:</label>{ingredients.map((ing, idx) => (<div key={idx} className="flex items-center space-x-2 mb-3"><input type="text" value={ing} onChange={(e) => handleIngredientChange(idx, e.target.value)} placeholder={`Ingredient ${idx + 1}`} className="block w-full shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 border-gray-300 rounded-md"/>{ingredients.length > 1 && <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50"><TrashIcon className="h-5 w-5" /></button>}</div>))}<button type="button" onClick={handleAddIngredient} className="mt-2 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-gray-50"><PlusCircleIcon className="h-5 w-5 mr-2 text-gray-400" />Add Ingredient</button></div>
              <div><label className="block text-lg font-semibold text-slate-700 mb-3">Dietary Restrictions (Optional):</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">{['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb', 'Keto', 'Paleo'].map(diet => (<label key={diet} className="flex items-center space-x-2.5 cursor-pointer group"><input type="checkbox" value={diet} onChange={handleDietaryChange} className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-offset-1"/><span className="text-slate-700 group-hover:text-orange-600 transition-colors text-sm">{diet}</span></label>))}</div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8"><div><label htmlFor="cuisine" className="block text-lg font-semibold text-slate-700 mb-2">Preferred Cuisine (Optional):</label><input type="text" id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g., Italian, Mexican" className="block w-full shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 border-gray-300 rounded-md"/></div><div><label htmlFor="skillLevel" className="block text-lg font-semibold text-slate-700 mb-2">Cooking Skill Level:</label><select id="skillLevel" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className="block w-full shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border-gray-300 rounded-md bg-white"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div><div><label htmlFor="mealType" className="block text-lg font-semibold text-slate-700 mb-2">Meal Type (Optional):</label><select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value)} className="block w-full shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border-gray-300 rounded-md bg-white"><option value="">Any</option><option>Breakfast</option><option>Brunch</option><option>Lunch</option><option>Dinner</option><option>Snack</option><option>Dessert</option><option>Appetizer</option><option>Side Dish</option></select></div></div>
              <div><label htmlFor="specificRequests" className="block text-lg font-semibold text-slate-700 mb-2">Other Specific Requests (Optional):</label><textarea id="specificRequests" value={specificRequests} onChange={(e) => setSpecificRequests(e.target.value)} rows={3} placeholder="e.g., make it spicy, low-sodium, one-pot meal..." className="block w-full shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 border-gray-300 rounded-md"/></div>
              <div className="pt-2"><button type="submit" disabled={isLoading} className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60"><BeakerIcon className="h-6 w-6 mr-2.5" />Generate Recipe</button></div>
            </form>
          </>
        )}
        
        {isLoading && (
            <div className="mt-12 bg-white shadow-xl rounded-lg p-10 text-center">
                <div className="flex justify-center items-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
                </div>
                <p className="text-xl font-semibold text-slate-700">Generating your culinary masterpiece...</p>
                <p className="text-slate-500">This might take a moment.</p>
            </div>
        )}

        {error && !isLoading && (
          <div className="mt-12 bg-red-50 p-6 rounded-lg text-center shadow-lg">
            <h2 className="text-2xl font-semibold text-red-700 mb-3">Oops! Something went wrong.</h2>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button onClick={handleTryAgainOrNew} className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"><ArrowPathIcon className="h-5 w-5 mr-2"/> Try Generating Again</button>
          </div>
        )}
        
        {generatedRecipe && !error && !isLoading && (
          <div className="mt-12 bg-white shadow-xl rounded-lg p-6 sm:p-10">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">
                    {(generatedRecipe.name && generatedRecipe.name !== "AI Generated Recipe (Parsing Pending)" && generatedRecipe.name !== "Untitled AI Recipe") ? generatedRecipe.name : "AI Generated Recipe"}
                </h2>
                {isRecipeConsideredParsed && generatedRecipe.description && 
                    <p className="mt-3 text-md text-slate-600 max-w-2xl mx-auto">{generatedRecipe.description}</p>
                }
            </div>
            
            {isRecipeConsideredParsed ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2 mb-8 text-sm text-center border-y border-slate-200 py-4">
                        {generatedRecipe.prepTime && <div><p className="text-slate-500">Prep Time</p><p className="font-semibold text-slate-700">{generatedRecipe.prepTime}</p></div>}
                        {generatedRecipe.cookTime && <div><p className="text-slate-500">Cook Time</p><p className="font-semibold text-slate-700">{generatedRecipe.cookTime}</p></div>}
                        {generatedRecipe.servings && <div><p className="text-slate-500">Servings</p><p className="font-semibold text-slate-700">{generatedRecipe.servings}</p></div>}
                        {generatedRecipe.cuisine && <div><p className="text-slate-500">Cuisine</p><p className="font-semibold text-slate-700">{generatedRecipe.cuisine}</p></div>}
                    </div>
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        <div className="lg:col-span-1 mb-8 lg:mb-0">
                            {generatedRecipe.ingredients && generatedRecipe.ingredients.length > 0 && (
                                <><h3 className="text-xl font-semibold text-slate-700 mb-4">Ingredients:</h3><ul className="space-y-2 text-slate-700">{generatedRecipe.ingredients.map((ing, index) => (<li key={index} className="flex items-start"><span className="text-orange-500 mr-2 mt-1">✓</span><span>{`${ing.quantity || ''} ${ing.unit || ''} ${ing.item}`.trim()}{ing.notes ? <span className="text-xs text-slate-500 italic"> ({ing.notes})</span> : ''}</span></li>))}</ul></>
                            )}
                        </div>
                        <div className="lg:col-span-2">
                             {generatedRecipe.instructions && generatedRecipe.instructions.length > 0 && (
                                <><h3 className="text-xl font-semibold text-slate-700 mb-4">Instructions:</h3><ol className="space-y-3 text-slate-700 leading-relaxed">{generatedRecipe.instructions.map((step, index) => (<li key={index} className="flex"><span className="bg-orange-500 text-white rounded-full h-6 w-6 min-w-[24px] text-sm flex items-center justify-center mr-3 font-semibold">{index + 1}</span><span>{step}</span></li>))}</ol></>
                            )}
                        </div>
                    </div>
                    {/* Notes */}
                    {generatedRecipe.notes && (<div className="mt-8 p-4 bg-sky-50 rounded-md border border-sky-200"><h4 className="font-semibold text-sky-700 mb-1 text-lg">Chef&apos;s Notes:</h4><p className="text-sm text-sky-800 whitespace-pre-line">{generatedRecipe.notes}</p></div>)}
                </>
            ) : (
                <div className="py-4">
                    <p className="text-center text-slate-600 mb-2">
                        The AI is still perfecting the recipe details, or the format wasn&apos;t fully recognized.
                    </p>
                    <p className="text-center text-slate-600 mb-6 font-semibold">
                        Here&apos;s the direct output from the AI for you to review:
                    </p>
                    {rawAIResponse ? (
                        <pre className="text-sm bg-gray-50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap border border-gray-200">
                            {rawAIResponse}
                        </pre>
                    ) : (
                        <p className="text-center text-slate-500">No raw output available to display.</p>
                    )}
                </div>
            )}

            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-center sm:justify-end">
                {generatedRecipe._id ? (
                    <Link href={`/dashboard/my-recipes/${generatedRecipe._id}`} className="w-full sm:w-auto order-1 sm:order-2 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                       <CheckCircleIcon className="h-5 w-5 mr-2" /> View Saved Recipe
                    </Link>
                ) : (
                     <button title="Save recipe functionality to be implemented" disabled className="w-full sm:w-auto order-1 sm:order-2 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-slate-400 cursor-not-allowed">
                        Save Recipe (TODO)
                    </button>
                )}
                 <button 
                    onClick={handleTryAgainOrNew}
                    className="w-full sm:w-auto order-2 sm:order-1 inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    <SparklesIcon className="h-5 w-5 mr-2"/> Generate Another
                </button>
            </div>

            {/* Toggle for Raw AI Output (collapsible section) */}
            <div className="mt-8">
                <button onClick={() => setShowRawOutputToggle(!showRawOutputToggle)} className="text-xs text-slate-500 hover:text-slate-700 flex items-center">
                    {showRawOutputToggle ? <ChevronUpIcon className="h-4 w-4 mr-1" /> : <ChevronDownIcon className="h-4 w-4 mr-1" />}
                    {showRawOutputToggle ? "Hide" : "Show"} Full Raw AI Output (for debugging)
                </button>
                {showRawOutputToggle && rawAIResponse && (
                  <pre className="mt-2 text-xs bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap border border-gray-200">
                    {rawAIResponse}
                  </pre>
                )}
                 {!rawAIResponse && showRawOutputToggle && <p className="text-xs text-slate-400 mt-1">No raw output data to display.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}