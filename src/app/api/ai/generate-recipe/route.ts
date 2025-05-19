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
  The user will provide details like ingredients, dietary restrictions, preferred cuisine, skill level, meal type, and specific requests.
  Your goal is to generate a complete recipe based on these inputs.

  The recipe MUST include the following clearly marked sections:
  - Recipe Name: (A catchy and descriptive name)
  - Description: (A brief, enticing overview of the dish)
  - Prep Time: (e.g., "15 minutes")
  - Cook Time: (e.g., "30 minutes")
  - Servings: (e.g., "4 servings")
  - Cuisine: (e.g., "Italian", "Mexican", "As per request or AI suggestion")
  - Ingredients: (List each ingredient on a new line, starting with a hyphen '-', ideally with quantity and unit, e.g., "- 1 cup All-purpose Flour", "- 2 large Eggs", "- 1 tsp Vanilla Extract")
  - Instructions: (Provide clear, step-by-step cooking instructions. Number each step, e.g., "1. Preheat oven...")
  - Notes: (Optional: any tips, variations, or storage instructions)

  Prioritize using the provided ingredients. If ingredients are scarce, suggest simple additions or be creative.
  Adhere strictly to dietary restrictions.
  If cuisine is specified, try to match it. If not, be creative or suggest a suitable one.
  Tailor complexity to the user's skill level.
  Be encouraging and friendly in your tone.
  If the request is vague, make reasonable assumptions and state them if necessary.
  Output ONLY the recipe structure defined above. Do not include any conversational fluff, greetings, or closing remarks before or after the recipe content.
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
    console.log("Sending request to OpenAI with model gpt-4o-mini...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.6,
      max_tokens: 1500,
    });

    // console.log("OpenAI Raw Choice:", JSON.stringify(completion.choices[0], null, 2));


    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      console.error("OpenAI response content is null or undefined. Full completion:", JSON.stringify(completion, null, 2));
      throw new Error("AI did not return any recipe content.");
    }
    return aiResponse.trim();
  } catch (error: any) {
    console.error("Error calling OpenAI service:", error.message);
    if (error.response) {
        console.error("OpenAI API Error Response Data:", error.response.data);
        console.error("OpenAI API Error Response Status:", error.response.status);
    } else if (error instanceof OpenAI.APIError) {
        console.error("OpenAI SDK APIError Status:", error.status);
        console.error("OpenAI SDK APIError Headers:", error.headers);
        console.error("OpenAI SDK APIError Error Object:", error.error);
    }
    throw new Error(`Failed to get a response from AI service: ${error.message}`);
  }
}

function parseAIRecipeText(
  aiResponseText: string,
  promptData: PromptData
): Partial<Omit<IRecipe, '_id' | 'userId' | 'createdAt' | 'updatedAt'>> {
  const recipe: Partial<Omit<IRecipe, '_id' | 'userId' | 'createdAt' | 'updatedAt'>> = {
    name: "AI Generated Recipe (Parsing Pending)",
    ingredients: [],
    instructions: [],
    source: 'ai',
    aiPrompt: promptData,
    tags: [],
  };

  const lines = aiResponseText.split('\n').map(line => line.trim());
  let currentSection: 'description' | 'prep' | 'cook' | 'servings' | 'cuisine' | 'ingredients' | 'instructions' | 'notes' | null = null;

  for (const line of lines) {
    if (!line) continue;

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
      if(recipe.cuisine && recipe.tags) recipe.tags.push(recipe.cuisine.toLowerCase());
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

    if (currentSection === 'description') recipe.description = (recipe.description ? recipe.description + " " : "") + line;
    else if (currentSection === 'notes') recipe.notes = (recipe.notes ? recipe.notes + " " : "") + line;
    else if (currentSection === 'ingredients' && line.startsWith('-')) {
      const ingredientText = line.substring(1).trim();
      const parts = ingredientText.match(/^([\d./\s\S]+?)\s+(.+)$/);
      if (parts && parts[1] && parts[2]) {
        const qtyUnitMatch = parts[1].trim().match(/^([\d./-]+)\s*([a-zA-Zµ]+)?$/);
        if (qtyUnitMatch) {
            recipe.ingredients!.push({
                quantity: qtyUnitMatch[1]?.trim() || "1",
                unit: qtyUnitMatch[2]?.trim() || undefined,
                item: parts[2].trim(),
            });
        } else {
             recipe.ingredients!.push({ quantity: parts[1].trim(), item: parts[2].trim() });
        }
      } else {
        recipe.ingredients!.push({ quantity: "As needed", item: ingredientText });
      }
    } else if (currentSection === 'instructions' && /^\d+\.\s*/.test(line)) {
      recipe.instructions!.push(line.replace(/^\d+\.\s*/, '').trim());
    } else if (currentSection === 'instructions' && recipe.instructions!.length > 0 && line) {
      recipe.instructions![recipe.instructions!.length - 1] += ` ${line}`;
    }
  }

  if (promptData.dietaryRestrictions && promptData.dietaryRestrictions.length > 0 && recipe.tags) {
    recipe.tags = [...recipe.tags, ...promptData.dietaryRestrictions.map(d => d.toLowerCase())];
  }
  if (promptData.mealType && recipe.tags) {
    recipe.tags.push(promptData.mealType.toLowerCase());
  }
  if (recipe.tags) {
    recipe.tags = [...new Set(recipe.tags.filter(tag => tag))];
  }

  if (recipe.name === "AI Generated Recipe (Parsing Pending)" && recipe.description) {
    recipe.name = recipe.description.split('.')[0].substring(0, 60) + "...";
  }
  if (!recipe.name) recipe.name = "Untitled AI Recipe";


  return recipe;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key is not configured in .env");
    return NextResponse.json({ message: 'AI service is not configured.' }, { status: 503 });
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
      ingredients: ingredients.filter((i: any) => typeof i === 'string' && i.trim() !== ''),
      dietaryRestrictions: Array.isArray(dietaryRestrictions) ? dietaryRestrictions.filter((d: any) => typeof d === 'string') : [],
      cuisine: typeof cuisine === 'string' && cuisine.trim() !== '' ? cuisine : undefined,
      skillLevel: typeof skillLevel === 'string' && skillLevel.trim() !== '' ? skillLevel : undefined,
      mealType: typeof mealType === 'string' && mealType.trim() !== '' ? mealType : undefined,
      specificRequests: typeof specificRequests === 'string' && specificRequests.trim() !== '' ? specificRequests : undefined,
    };

    const aiResponseText = await callOpenAIService(promptData);
    const parsedRecipeData = parseAIRecipeText(aiResponseText, promptData);

    const newRecipe = new RecipeModel({
      ...parsedRecipeData,
      userId: new mongoose.Types.ObjectId(session.user.id),
    });

    const savedRecipe = await newRecipe.save();

    return NextResponse.json({ recipe: savedRecipe, rawAIResponse: aiResponseText }, { status: 200 });

  } catch (error: any) {
    console.error('API Route - AI Recipe Generation Error:', error.message);
    let errorMessage = 'Failed to generate or save recipe.';
    let statusCode = 500;

    if (error.message?.toLowerCase().includes('quota')) {
        errorMessage = 'AI service quota may have been exceeded. Please check your OpenAI plan and billing details.';
        statusCode = 429;
    } else if (error.message?.toLowerCase().includes('api key') || (error instanceof OpenAI.AuthenticationError)) {
        errorMessage = 'AI service authentication failed. Please check server configuration (API Key).';
        statusCode = 500;
    } else if (error instanceof OpenAI.APIError) {
        errorMessage = `AI Service Error: ${error.name}`;
        statusCode = error.status || 500;
    } else if (error.message?.includes('Failed to get a response from AI service')) {
        errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage}, { status: statusCode });
  }
}