import mongoose, { Document, Schema } from "mongoose";

export interface ICategory {
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDocument = Document & ICategory;

const CategorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and performance
CategorySchema.index({ name: "text", description: "text" });
CategorySchema.index({ createdAt: -1 });

export const Category = mongoose.model<CategoryDocument>(
  "Category",
  CategorySchema
);
