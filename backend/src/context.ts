import DataLoader from "dataloader";
import { Category, CategoryDocument } from "./models/Category";
import mongoose from "mongoose";

export interface GraphQLContext {
  user: string | null;
  categoryLoader: DataLoader<string, CategoryDocument | null>;
}

export function createCategoryLoader(): DataLoader<
  string,
  CategoryDocument | null
> {
  return new DataLoader(async (categoryIds: readonly string[]) => {
    // Convert string IDs to ObjectIds
    const objectIds = categoryIds.map((id) => new mongoose.Types.ObjectId(id));

    // Fetch all categories in one query
    const categories = await Category.find({
      _id: { $in: objectIds },
    });

    // Create a map for quick lookup
    const categoryMap = new Map<string, CategoryDocument>();
    categories.forEach((category) => {
      categoryMap.set(category._id.toString(), category);
    });

    // Return categories in the same order as requested
    return categoryIds.map((id) => categoryMap.get(id) || null);
  });
}
