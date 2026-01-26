"use client";

import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CalculatorIcon, SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface NutritionResult {
  totalEstimatedCalories: number;
  ingredients: {
    ingredient: string;
    estimatedCalories: number;
    benefits: string[];
    demerits: string[];
  }[];
}

export default function CalorieCalculatorPage() {
  const { status } = useSession();
  const router = useRouter();

  const [ingredientsText, setIngredientsText] = useState('');
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/session/new?callbackUrl=/calorie-calculator');
    }
  }, [status, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    if (ingredientsText.trim() === '') {
        setError('Please enter some ingredients.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/ai/calculate-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredientsText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get nutrition data.');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIngredientsText('');
    setResult(null);
    setError(null);
    setIsLoading(false);
  };
  
  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        <p className="mt-4 text-xl font-semibold text-slate-700">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
      return (
          <div className="flex justify-center items-center min-h-screen"><p className="text-xl">Redirecting to login...</p></div>
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <CalculatorIcon className="mx-auto h-12 w-12 text-orange-500" />
          <h1 className="mt-2 text-4xl font-extrabold text-slate-800 sm:text-5xl">
            Nutrition Calculator
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Enter your ingredients below (one per line, e.g., &quot;1 cup flour&quot;, &quot;2 large eggs&quot;) to get an AI-powered nutritional analysis.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-6 sm:p-10">
          <form onSubmit={handleSubmit}>
            <textarea
              rows={6}
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="e.g.
100g chicken breast
1 cup white rice
1 tbsp olive oil
..."
              className="block w-full shadow-sm py-3 px-4 placeholder-slate-400 focus:ring-orange-500 focus:border-orange-500 border border-slate-300 rounded-md text-base"
              disabled={isLoading}
            />
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
               <button
                  type="button"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2"/>
                  Reset
                </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Calculate Nutrition
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
            <div className="mt-8 bg-red-50 p-6 rounded-lg text-center shadow-md">
                <h3 className="text-xl font-semibold text-red-700">An Error Occurred</h3>
                <p className="mt-2 text-red-600">{error}</p>
            </div>
        )}

        {result && (
          <div className="mt-10 bg-white shadow-xl rounded-lg p-6 sm:p-10">
            <h2 className="text-3xl font-bold text-slate-800 text-center">Analysis Results</h2>
            <div className="mt-6 text-center bg-orange-50 border border-orange-200 rounded-lg p-6">
                <p className="text-lg text-orange-700">Total Estimated Calories</p>
                <p className="text-5xl font-extrabold text-orange-600">{result.totalEstimatedCalories.toLocaleString()} kcal</p>
                <p className="text-sm text-slate-500 mt-2">This is an AI-generated estimate and may not be 100% accurate.</p>
            </div>
            
            <div className="mt-8 space-y-6">
                <h3 className="text-2xl font-semibold text-slate-700 border-b pb-2">Ingredient Breakdown</h3>
                {result.ingredients.map((item, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="text-lg font-bold text-slate-800">{item.ingredient}</h4>
                        <p className="text-md font-semibold text-orange-600 mb-3">~{item.estimatedCalories.toLocaleString()} kcal</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h5 className="font-semibold text-green-700 flex items-center mb-1">
                                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500"/>
                                    Potential Benefits
                                </h5>
                                <ul className="list-disc list-inside pl-2 text-slate-600 space-y-1">
                                    {item.benefits.length > 0 ? item.benefits.map((benefit, i) => (
                                        <li key={i}>{benefit}</li>
                                    )) : <li>No specific benefits identified.</li>}
                                </ul>
                            </div>
                             <div>
                                <h5 className="font-semibold text-yellow-800 flex items-center mb-1">
                                    <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500"/>
                                    Potential Considerations
                                </h5>
                                <ul className="list-disc list-inside pl-2 text-slate-600 space-y-1">
                                    {item.demerits.length > 0 ? item.demerits.map((demerit, i) => (
                                        <li key={i}>{demerit}</li>
                                    )) : <li>No specific considerations identified.</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}