/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import RecipeModel, { IRecipe } from '@/models/Recipe';
import mongoose from 'mongoose';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PromptData {
  ingredients: string[];
  dietaryRestrictions: string[];
  cuisine?: string;
  skillLevel?: string;
  mealType?: string; 
  specificRequests?: string; 
}

async function callOpenAIService(promptData: PromptData): Promise<string> {
  const systemMessage = `You are DishWish AI, a helpful culinary assistant that generates creative and practical recipes.
  The user will provide a list of ingredients they have, dietary restrictions, preferred cuisine, skill level, meal type, and any specific requests.
  Your goal is to generate a complete recipe based on these inputs.

  The recipe should include the following clearly marked sections:
  - Recipe Name: (A catchy and descriptive name)
  - Description: (A brief, enticing overview of the dish)
  - Prep Time: (e.g., "15 minutes")
  - Cook Time: (e.g., "30 minutes")
  - Servings: (e.g., "4 servings")
  - Cuisine: (e.g., "Italian", "Mexican", "As per request or AI suggestion")
  - Ingredients: (List each ingredient on a new line, ideally with quantity and unit, e.g., "- 1 cup All-purpose Flour", "- 2 large Eggs", "- 1 tsp Vanilla Extract")
  - Instructions: (Provide clear, step-by-step cooking instructions. Number each step.)
  - Notes: (Optional: any tips, variations, or storage instructions)

  Prioritize using the provided ingredients. If ingredients are scarce, suggest simple additions or be creative.
  Adhere strictly to dietary restrictions.
  If cuisine is specified, try to match it. If not, be creative or suggest a suitable one.
  Tailor complexity to the user's skill level.
  Be encouraging and friendly in your tone.
  If the request is vague, make reasonable assumptions and state them if necessary.
  Do not include any conversational fluff before or after the recipe itself. Output only the recipe structure defined above.
  `;

  let userPrompt = "Please generate a recipe with the following details:\n";
  if (promptData.ingredients.length > 0) {
    userPrompt += `- Ingredients I have: ${promptData.ingredients.join(', ')}\n`;
  } else {
    userPrompt += `- I don't have specific ingredients in mind, please suggest something based on other preferences.\n`;
  }
  if (promptData.dietaryRestrictions.length > 0) {
    userPrompt += `- Dietary Restrictions: ${promptData.dietaryRestrictions.join(', ')}\n`;
  }
  if (promptData.cuisine) {
    userPrompt += `- Preferred Cuisine: ${promptData.cuisine}\n`;
  }
  if (promptData.skillLevel) {
    userPrompt += `- My Cooking Skill Level: ${promptData.skillLevel}\n`;
  }
  if (promptData.mealType) {
    userPrompt += `- Meal Type: ${promptData.mealType}\n`;
  }
  if (promptData.specificRequests) {
    userPrompt += `- Specific Requests: ${promptData.specificRequests}\n`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("AI did not return a recipe content.");
    }
    return aiResponse.trim();
  } catch (error) {
    console.error("Error calling OpenAI service:", error);
    throw new Error("Failed to get a response from AI service.");
  }
}

function parseAIRecipeText(
  aiResponseText: string,
  promptData: PromptData
): Partial<Omit<IRecipe, '_id' | 'userId' | 'createdAt' | 'updatedAt'>> {
  const recipe: Partial<Omit<IRecipe, '_id' | 'userId' | 'createdAt' | 'updatedAt'>> = {
    ingredients: [],
    instructions: [],
    source: 'ai',
    aiPrompt: promptData,
    tags: [],
  };

  const lines = aiResponseText.split('\n').map(line => line.trim()).filter(line => line);

  let currentSection: 'name' | 'description' | 'prep' | 'cook' | 'servings' | 'cuisine' | 'ingredients' | 'instructions' | 'notes' | null = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.startsWith("recipe name:")) {
      recipe.name = line.substring("recipe name:".length).trim();
      currentSection = null; continue;
    }
    if (lowerLine.startsWith("description:")) {
      recipe.description = line.substring("description:".length).trim();
      currentSection = 'description'; continue;
    }
    if (lowerLine.startsWith("prep time:")) {
      recipe.prepTime = line.substring("prep time:".length).trim();
      currentSection = null; continue;
    }
    if (lowerLine.startsWith("cook time:")) {
      recipe.cookTime = line.substring("cook time:".length).trim();
      currentSection = null; continue;
    }
    if (lowerLine.startsWith("servings:")) {
      recipe.servings = parseInt(line.substring("servings:".length).trim().split(' ')[0], 10) || undefined;
      currentSection = null; continue;
    }
    if (lowerLine.startsWith("cuisine:")) {
      recipe.cuisine = line.substring("cuisine:".length).trim();
      if(recipe.cuisine) recipe.tags?.push(recipe.cuisine.toLowerCase());
      currentSection = null; continue;
    }
    if (lowerLine.startsWith("ingredients:")) {
      currentSection = 'ingredients'; continue;
    }
    if (lowerLine.startsWith("instructions:") || lowerLine.startsWith("steps:")) {
      currentSection = 'instructions'; continue;
    }
    if (lowerLine.startsWith("notes:")) {
      recipe.notes = line.substring("notes:".length).trim();
      currentSection = 'notes'; continue;
    }

    if (currentSection === 'description') recipe.description += ` ${line}`;
    else if (currentSection === 'notes') recipe.notes += ` ${line}`;
    else if (currentSection === 'ingredients' && (line.startsWith('-') || line.startsWith('*'))) {
      const ingredientText = line.substring(1).trim();
      const parts = ingredientText.match(/^([\d./\s]+)?\s*([a-zA-Z\s\(\)]+)?\s+(.+)$/);
      if (parts && parts[3]) {
        recipe.ingredients!.push({
          quantity: parts[1]?.trim() || "As needed",
          unit: parts[2]?.trim() || undefined,
          item: parts[3].trim(),
        });
      } else {
        recipe.ingredients!.push({ quantity: "As needed", item: ingredientText });
      }
    } else if (currentSection === 'instructions' && /^\d+\./.test(line)) {
      recipe.instructions!.push(line.replace(/^\d+\.\s*/, '').trim());
    }
  }

  if (promptData.dietaryRestrictions && promptData.dietaryRestrictions.length > 0) {
    recipe.tags = [...(recipe.tags || []), ...promptData.dietaryRestrictions.map(d => d.toLowerCase())];
  }
  if (promptData.mealType) {
    recipe.tags?.push(promptData.mealType.toLowerCase());
  }
  if (recipe.tags) {
    recipe.tags = [...new Set(recipe.tags)];
  }


  if (!recipe.name && recipe.description) {
    recipe.name = recipe.description.split('.')[0].substring(0, 50) + " (AI Generated)";
  } else if (!recipe.name) {
    recipe.name = "AI Generated Recipe";
  }


  return recipe;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !('id' in session.user) || typeof (session.user as any).id !== 'string') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key is not configured.");
    return NextResponse.json({ message: 'AI service is not configured by the administrator.' }, { status: 503 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const {
      ingredients,
      dietaryRestrictions,
      cuisine,
      skillLevel,
      mealType,
      specificRequests
    } = body as PromptData;

    if (!Array.isArray(ingredients)) {
        return NextResponse.json({ message: 'Ingredients must be an array' }, { status: 400 });
    }

    const promptData: PromptData = {
      ingredients: ingredients.filter((i: unknown): i is string => typeof i === 'string' && i.trim() !== ''),
      dietaryRestrictions: Array.isArray(dietaryRestrictions) ? dietaryRestrictions.filter((d: unknown): d is string => typeof d === 'string') : [],
      cuisine: typeof cuisine === 'string' ? cuisine : undefined,
      skillLevel: typeof skillLevel === 'string' ? skillLevel : undefined,
      mealType: typeof mealType === 'string' ? mealType : undefined,
      specificRequests: typeof specificRequests === 'string' ? specificRequests : undefined,
    };

    const aiResponseText = await callOpenAIService(promptData);
    const parsedRecipeData = parseAIRecipeText(aiResponseText, promptData);

    if (!session.user || typeof (session.user as { id?: unknown }).id !== 'string') {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    if (typeof userId !== 'string') {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const newRecipe = new RecipeModel({
      ...parsedRecipeData,
      userId: new mongoose.Types.ObjectId(userId),
    });

    const savedRecipe = await newRecipe.save();

    return NextResponse.json({ recipe: savedRecipe, rawAIResponse: aiResponseText }, { status: 200 });

  } catch (error: unknown) {
    console.error('AI Recipe Generation or Saving Error:', error);
    let errorMessage = 'Failed to generate or save recipe due to an internal error.';
    let statusCode = 500;

    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      const message = ((error as { message?: string }).message || '').toLowerCase();
      if (message.includes('quota')) {
        errorMessage = 'AI service quota may have been exceeded. Please try again later.';
        statusCode = 429;
      } else if (message.includes('api key')) {
        errorMessage = 'AI service authentication failed. Please check server configuration.';
      }
    }

    if (error instanceof OpenAI.APIError) {
      errorMessage = `AI Service Error: ${error.name} - ${error.message}`;
      statusCode = error.status || 500;
    }

    return NextResponse.json({ message: errorMessage, details: (error as { message?: string }).message }, { status: statusCode });
  }
}
