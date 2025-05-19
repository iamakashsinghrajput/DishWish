/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"
import dbConnect from '@/lib/db';
import RecipeModel, { IRecipe} from '@/models/Recipe'; // Ensure IIngredient is exported
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
  const systemMessage = `You are DishWish AI. Generate a recipe based on user inputs.
  Output ONLY the recipe content. Adhere STRICTLY to the following format. Each section MUST start with its exact marker.

  Recipe Name: [The Recipe Name]

  Description: [A concise, enticing description of the dish. Max 2-3 sentences.]

  Prep Time: [e.g., 15 minutes]

  Cook Time: [e.g., 30 minutes]

  Servings: [e.g., 4 servings]

  Cuisine: [e.g., Italian. If unknown, state "Various" or suggest one.]

  Ingredients:
  - [Quantity] [Unit (optional)] [Ingredient Name] | [Optional notes like "chopped", "melted"]
  - [Quantity] [Unit (optional)] [Ingredient Name] | [Optional notes]
  (Each ingredient on a new line, starting with "- ". Use a pipe "|" to separate item from notes if notes exist.)

  Instructions:
  1. [First step of the instructions...]
  2. [Second step...]
  (Number each step, followed by a period and space: "1. ")

  Notes:
  [Optional tips, variations, or storage instructions. If none, write "Notes: None" or omit the entire Notes section.]

  DO NOT include any text before "Recipe Name:" or after the "Notes:" section (or the last instruction if no notes).
  Be very precise with the section markers.
  `;

  let userPrompt = "Generate a recipe based on these details:\n";
  userPrompt += `Ingredients Provided: ${promptData.ingredients.length > 0 ? promptData.ingredients.join(', ') : 'None, suggest based on other preferences.'}\n`;
  if (promptData.dietaryRestrictions.length > 0) userPrompt += `Dietary Restrictions: ${promptData.dietaryRestrictions.join(', ')}\n`;
  if (promptData.cuisine) userPrompt += `Preferred Cuisine: ${promptData.cuisine}\n`;
  if (promptData.skillLevel) userPrompt += `Cooking Skill Level: ${promptData.skillLevel}\n`;
  if (promptData.mealType) userPrompt += `Meal Type: ${promptData.mealType}\n`;
  if (promptData.specificRequests) userPrompt += `Specific Requests: ${promptData.specificRequests}\n`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or your preferred model
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4, // Even lower for stricter adherence to format
      // max_tokens: 1800, // Adjust if needed
    });
    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) throw new Error("AI did not return any recipe content.");
    return aiResponse.trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error calling OpenAI service:", error.message);
    if (error instanceof OpenAI.APIError) console.error("OpenAI SDK APIError Details:", error);
    throw new Error(`Failed to get a response from AI service: ${error.message}`);
  }
}

function parseAIRecipeText(
  aiResponseText: string,
  promptData: PromptData
): Partial<Omit<IRecipe, '_id' | 'userId' | 'createdAt' | 'updatedAt'>> {
  const recipe: Partial<Omit<IRecipe, '_id' | 'userId' | 'createdAt' | 'updatedAt'>> = {
    source: 'ai',
    aiPrompt: promptData,
    tags: [],
    ingredients: [],
    instructions: [],
  };

  const sectionsMap = {
    "Recipe Name:": "name",
    "Description:": "description",
    "Prep Time:": "prepTime",
    "Cook Time:": "cookTime",
    "Servings:": "servings",
    "Cuisine:": "cuisine",
    "Ingredients:": "ingredients",
    "Instructions:": "instructions",
    "Notes:": "notes",
  } as const; // Make keys specific

  type SectionKey = keyof typeof sectionsMap;
  type RecipeFieldKey = typeof sectionsMap[SectionKey];

  const lines = aiResponseText.split('\n');
  let currentSection: RecipeFieldKey | null = null;
  let collectingMultiLine = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    let isSectionMarker = false;

    for (const marker of Object.keys(sectionsMap) as SectionKey[]) {
      if (trimmedLine.toLowerCase().startsWith(marker.toLowerCase())) {
        currentSection = sectionsMap[marker];
        const content = trimmedLine.substring(marker.length).trim();
        if (currentSection !== 'ingredients' && currentSection !== 'instructions' && currentSection !== 'description' && currentSection !== 'notes') {
          (recipe as any)[currentSection] = content;
          collectingMultiLine = false;
        } else {
            if (content) { // If there's content on the marker line itself for description/notes
                 (recipe as any)[currentSection] = content;
            } else { // Initialize if empty, ready for next lines
                 (recipe as any)[currentSection] = (currentSection === 'ingredients' || currentSection === 'instructions') ? [] : '';
            }
            collectingMultiLine = true;
        }
        isSectionMarker = true;
        break;
      }
    }

    if (!isSectionMarker && currentSection && trimmedLine) {
      if (currentSection === 'ingredients' && trimmedLine.startsWith('-')) {
        const itemText = trimmedLine.substring(1).trim();
        const [itemPart, notesPart] = itemText.split('|').map(s => s.trim()); // Split by pipe for notes
        
        // Regex to capture: (1) quantity, (2) unit (optional), (3) item name
        const ingParts = itemPart.match(/^([\d\s./-]+(?:to taste|as needed)?)?\s*([a-zA-Zµ]+(?:\(s\))?)?\s*(.+)$/i);

        if (ingParts && ingParts[3]) {
          recipe.ingredients!.push({
            quantity: ingParts[1]?.trim() || "1",
            unit: ingParts[2]?.trim() || undefined,
            item: ingParts[3].trim(),
            notes: notesPart || undefined,
          });
        } else {
          recipe.ingredients!.push({ quantity: "As desired", item: itemPart, notes: notesPart || undefined });
        }
      } else if (currentSection === 'instructions' && /^\d+\.\s*/.test(trimmedLine)) {
        recipe.instructions!.push(trimmedLine.replace(/^\d+\.\s*/, '').trim());
      } else if ((currentSection === 'description' || currentSection === 'notes') && collectingMultiLine) {
        (recipe as any)[currentSection] = ((recipe as any)[currentSection] ? (recipe as any)[currentSection] + "\n" : "") + trimmedLine;
      }
    } else if (!isSectionMarker && !trimmedLine) {
        // If it's an empty line, it might signal the end of a multiline section like description or notes
        if (currentSection === 'description' || currentSection === 'notes') {
            collectingMultiLine = false; 
        }
    }
  }

  if (recipe.cuisine) recipe.tags!.push(recipe.cuisine.toLowerCase());
  if (promptData.dietaryRestrictions.length > 0) recipe.tags!.push(...promptData.dietaryRestrictions.map(d => d.toLowerCase()));
  if (promptData.mealType) recipe.tags!.push(promptData.mealType.toLowerCase());
  recipe.tags = [...new Set(recipe.tags!.filter(tag => tag && tag.trim() !== ''))];

  if (typeof recipe.servings === 'string') {
    const servingsStr = recipe.servings as string;
    const servingsMatch = servingsStr.match(/\d+/);
    recipe.servings = servingsMatch ? parseInt(servingsMatch[0], 10) : undefined;
  } else if (typeof recipe.servings === 'number') {
    // keep as is
  } else {
    recipe.servings = undefined;
  }

  if (!recipe.name || recipe.name.trim() === "") recipe.name = "Untitled AI Recipe";
  if (!recipe.instructions || recipe.instructions.length === 0) {
      // If instructions are missing, but raw text has content, put it as a note
      if (aiResponseText.length > 100 && !recipe.notes) { // Heuristic
          recipe.notes = "AI response might contain instructions, but they could not be parsed correctly. Please review raw output.";
      }
      // And ensure instructions is an empty array not undefined
      recipe.instructions = [];
  }
   if (!recipe.ingredients || recipe.ingredients.length === 0) {
       if (aiResponseText.length > 100 && !recipe.notes) {
           recipe.notes = (recipe.notes ? recipe.notes + "\n" : "") + "AI response might contain ingredients, but they could not be parsed correctly. Please review raw output.";
       }
       recipe.ingredients = [];
   }


  return recipe;
}

// ... (POST handler remains the same)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key is not configured in .env.local");
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

    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
        console.error("Invalid session user ID for recipe creation:", session.user.id);
        return NextResponse.json({ message: 'Invalid user session data.' }, { status: 400 });
    }
    const userIdAsObjectId = new mongoose.Types.ObjectId(session.user.id);

    const newRecipe = new RecipeModel({
      ...parsedRecipeData,
      userId: userIdAsObjectId,
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
    } else if (error.name === 'ValidationError' || error.message?.includes('validation failed')) {
        errorMessage = 'Recipe data validation failed. The AI-generated content might not meet expected structure.';
        statusCode = 400;
        console.error('Mongoose Validation Error details:', error.errors || error);
    } else if (error.message?.includes("input must be a 24 character hex string")) {
        errorMessage = "There was an issue with associating the recipe with your user account. Please try again.";
        statusCode = 500;
        console.error("ObjectId conversion issue suspect. Original error:", error);
    }
    return NextResponse.json({ message: errorMessage,  detailsForDev: error.message }, { status: statusCode });
  }
}