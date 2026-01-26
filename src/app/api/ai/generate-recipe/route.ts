import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from '@/lib/db';
import RecipeModel, {IIngredient } from '@/models/Recipe';
import mongoose from 'mongoose';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface PromptData {
  ingredients: string[];
  dietaryRestrictions: string[];
  cuisine?: string;
  skillLevel?: string;
  mealType?: string;
  specificRequests?: string;
}

interface AIResponseSchema {
  recipeName: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  totalCalories: number; // The new field for calories
  cuisine: string;
  ingredients: {
    quantity: string;
    unit?: string;
    item: string;
    notes?: string;
  }[];
  instructions: string[];
  notes?: string;
}

async function callGroqService(promptData: PromptData): Promise<string> {
  const systemMessage = `You are DishWish AI, a world-class culinary assistant. Your task is to generate a recipe based on user inputs.
  You MUST respond with ONLY a valid JSON object. Do not include any text, markdown, or explanations before or after the JSON.
  The JSON object must strictly adhere to the following schema:
  {
    "recipeName": "string",
    "description": "A concise, enticing description of the dish (2-3 sentences max).",
    "prepTime": "string (e.g., '15 minutes')",
    "cookTime": "string (e.g., '30 minutes')",
    "servings": "string (e.g., '4 servings')",
    "totalCalories": number, // A reasonable estimate of the total calories for the entire dish.
    "cuisine": "string (e.g., 'Italian'). If unknown, suggest one or use 'Various'.",
    "ingredients": [
      {
        "quantity": "string (e.g., '1', '1/2', 'to taste')",
        "unit": "string (optional, e.g., 'cup', 'tbsp')",
        "item": "string (e.g., 'all-purpose flour')",
        "notes": "string (optional, e.g., 'sifted', 'finely chopped')"
      }
    ],
    "instructions": ["string", "string", ...],
    "notes": "string (optional, provide tips, variations, or storage instructions. If none, this key can be omitted.)"
  }
  
  Generate a creative and delicious recipe based on the user's request. Prioritize using the ingredients provided by the user. Calculate and include the total estimated calories.`;

  let userPrompt = "Generate a recipe based on these details:\n";
  userPrompt += `- Ingredients Provided: ${promptData.ingredients.join(', ')}\n`;
  if (promptData.dietaryRestrictions.length > 0) userPrompt += `- Dietary Restrictions: ${promptData.dietaryRestrictions.join(', ')}\n`;
  if (promptData.cuisine) userPrompt += `- Preferred Cuisine: ${promptData.cuisine}\n`;
  if (promptData.skillLevel) userPrompt += `- Cooking Skill Level: ${promptData.skillLevel}\n`;
  if (promptData.mealType) userPrompt += `- Meal Type: ${promptData.mealType}\n`;
  if (promptData.specificRequests) userPrompt += `- Specific Requests: ${promptData.specificRequests}\n`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 2048,
    });
    
    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("AI did not return any recipe content.");
    }
    return aiResponse;
  } catch (error) {
    console.error("Error calling Groq service:", error);
    throw new Error(`Failed to get a response from AI service: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validatePromptData(body: any): PromptData {
    const {
        ingredients,
        dietaryRestrictions,
        cuisine,
        skillLevel,
        mealType,
        specificRequests
    } = body as Partial<PromptData>;

    if (!Array.isArray(ingredients)) {
        throw new Error('Ingredients must be an array.');
    }

    return {
        ingredients: ingredients.filter((i): i is string => typeof i === 'string' && i.trim() !== ''),
        dietaryRestrictions: Array.isArray(dietaryRestrictions) ? dietaryRestrictions.filter((d): d is string => typeof d === 'string') : [],
        cuisine: typeof cuisine === 'string' && cuisine.trim() !== '' ? cuisine : undefined,
        skillLevel: typeof skillLevel === 'string' && skillLevel.trim() !== '' ? skillLevel : undefined,
        mealType: typeof mealType === 'string' && mealType.trim() !== '' ? mealType : undefined,
        specificRequests: typeof specificRequests === 'string' && specificRequests.trim() !== '' ? specificRequests : undefined,
    };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    console.error("Groq API key is not configured.");
    return NextResponse.json({ message: 'AI service is not configured.' }, { status: 503 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const promptData = validatePromptData(body);

    const aiResponseJsonString = await callGroqService(promptData);
    const aiRecipeData: AIResponseSchema = JSON.parse(aiResponseJsonString);
  
    const servingsMatch = aiRecipeData.servings?.match(/\d+/);
    const servingsNumber = servingsMatch ? parseInt(servingsMatch[0], 10) : undefined;

    const tags: string[] = [];
    if (aiRecipeData.cuisine) tags.push(aiRecipeData.cuisine.toLowerCase());
    if (promptData.mealType) tags.push(promptData.mealType.toLowerCase());
    tags.push(...promptData.dietaryRestrictions.map(d => d.toLowerCase()));

    const newRecipeData = {
      userId: new mongoose.Types.ObjectId(session.user.id),
      name: aiRecipeData.recipeName || "Untitled AI Recipe",
      description: aiRecipeData.description,
      ingredients: aiRecipeData.ingredients as IIngredient[],
      instructions: aiRecipeData.instructions || [],
      prepTime: aiRecipeData.prepTime,
      cookTime: aiRecipeData.cookTime,
      servings: servingsNumber,
      totalCalories: aiRecipeData.totalCalories,
      cuisine: aiRecipeData.cuisine,
      skillLevel: promptData.skillLevel,
      tags: [...new Set(tags)].filter(Boolean),
      isFavorite: false,
      notes: aiRecipeData.notes,
      source: 'ai',
      aiPrompt: promptData,
    };
    
    const newRecipe = new RecipeModel(newRecipeData);
    const savedRecipe = await newRecipe.save();

    return NextResponse.json({ 
        recipe: savedRecipe, 
        rawAIResponse: aiResponseJsonString
    }, { status: 200 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('API Route - AI Recipe Generation Error:', error);
    let errorMessage = 'Failed to generate or save recipe.';
    let statusCode = 500;

    if (error instanceof SyntaxError) {
        errorMessage = 'Failed to parse AI response. The AI may have returned an invalid format.';
        statusCode = 500;
    } else if (error.message?.toLowerCase().includes('quota')) {
        errorMessage = 'AI service quota may have been exceeded. Please check your OpenAI plan and billing details.';
        statusCode = 429;
    } else if (error.message?.toLowerCase().includes('api key')) {
        errorMessage = 'AI service authentication failed. Check server configuration.';
        statusCode = 500;
    } else if (error instanceof mongoose.Error.ValidationError) {
        errorMessage = 'Recipe data validation failed. The AI-generated content might not meet expected structure.';
        statusCode = 400;
    }

    return NextResponse.json({ message: errorMessage,  detailsForDev: error.message }, { status: statusCode });
  }
}