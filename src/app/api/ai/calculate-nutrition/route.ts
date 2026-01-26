import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface NutritionAnalysis {
  totalEstimatedCalories: number;
  ingredients: {
    ingredient: string;
    estimatedCalories: number;
    benefits: string[];
    demerits: string[];
  }[];
}

async function callGroqService(ingredientsText: string): Promise<string> {
  const systemMessage = `You are a nutritional analysis AI assistant named DishWish AI.
  Your task is to analyze a list of ingredients and return nutritional information.
  You MUST respond with ONLY a valid JSON object. Do not include any text, code block markers, or explanations before or after the JSON.
  The JSON structure must be as follows:
  {
    "totalEstimatedCalories": number, // Total sum of calories for all ingredients
    "ingredients": [
      {
        "ingredient": "string", // The ingredient as entered by the user
        "estimatedCalories": number, // A reasonable calorie estimate for the given quantity. Use 0 if unable to determine.
        "benefits": ["string", "string", ...], // 2-3 key positive nutritional aspects or benefits.
        "demerits": ["string", "string", ...] // 2-3 potential considerations like high sugar/fat, common allergens, or processing concerns. If none, provide an empty array [].
      }
    ]
  }

  Analyze each ingredient line by line. If an ingredient is ambiguous or a quantity is missing, make a reasonable assumption (e.g., '1 apple', '1 tbsp of sugar') and base your calculation on that. If it's impossible to analyze, return that ingredient with 0 calories and mention the reason in the "demerits".
  Be concise and helpful.`;

  const userPrompt = `Analyze the following list of ingredients and provide the nutritional breakdown in the specified JSON format:\n\n${ingredientsText}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });
    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse || typeof aiResponse !== 'string') {
      throw new Error("AI did not return valid string content.");
    }
    return aiResponse;
  } catch (error: unknown) {
    console.error("Error calling Groq service for nutrition:", error);
    throw new Error(`Failed to get a response from AI service: ${(error as Error).message}`);
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ message: 'AI service is not configured.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { ingredients } = body as { ingredients: string };

    if (!ingredients || typeof ingredients !== 'string' || ingredients.trim() === '') {
      return NextResponse.json({ message: 'Ingredients text is required.' }, { status: 400 });
    }

    const aiResponseText = await callGroqService(ingredients);

    let nutritionData: NutritionAnalysis;
    try {
      nutritionData = JSON.parse(aiResponseText);
    } catch (parseError) {
      console.error('Failed to parse AI response JSON:', parseError);
      return NextResponse.json({ message: 'Invalid response format from AI service.' }, { status: 500 });
    }

    return NextResponse.json(nutritionData, { status: 200 });

  } catch (error: unknown) {
    console.error('API Route - Nutrition Calculation Error:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ message: 'Failed to calculate nutrition.', details: errorMessage }, { status: 500 });
  }
}
