import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IIngredient {
  item: string;
  quantity: string;
  unit?: string;
  notes?: string;
}

export interface IRecipe extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  description?: string;
  ingredients: IIngredient[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: number;
  totalCalories?: number;
  cuisine?: string;
  course?: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  tags?: string[];
  imageUrl?: string;
  isFavorite?: boolean;
  notes?: string;
  source: 'ai' | 'user_created' | 'imported';
  aiPrompt?: {
    ingredients?: string[];
    dietaryRestrictions?: string[];
    cuisine?: string;
    skillLevel?: string;
    mealType?: string;
    specificRequests?: string;
  } | string;
  rating?: number;
  timesMade?: number;
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema: Schema<IIngredient> = new Schema({
  item: { type: String, required: true, trim: true },
  quantity: { type: String, required: true, trim: true },
  unit: { type: String, trim: true },
  notes: { type: String, trim: true },
}, { _id: false });

const RecipeSchema: Schema<IRecipe> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, index: true },
  description: { type: String, trim: true },
  ingredients: { type: [IngredientSchema], default: [] },
  instructions: { type: [String], required: true, default: [] },
  prepTime: { type: String, trim: true },
  cookTime: { type: String, trim: true },
  totalTime: { type: String, trim: true },
  servings: { type: Number },
  totalCalories: { type: Number },
  cuisine: { type: String, trim: true, lowercase: true },
  course: { type: String, trim: true, lowercase: true },
  skillLevel: { type: String, trim: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  imageUrl: { type: String, trim: true },
  isFavorite: { type: Boolean, default: false },
  notes: { type: String, trim: true },
  source: { type: String, enum: ['ai', 'user_created', 'imported'], default: 'user_created', required: true },
  aiPrompt: { type: Schema.Types.Mixed },
  rating: { type: Number, min: 1, max: 5 },
  timesMade: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

RecipeSchema.index({ name: 'text', description: 'text', tags: 'text', cuisine: 'text' });

const RecipeModel: Model<IRecipe> = mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default RecipeModel;