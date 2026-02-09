import { GraphQLError } from "graphql";
import { Category } from "../models/Category";
import { Risk } from "../models/Risk";
import { GraphQLContext } from "../context";
import mongoose from "mongoose";

interface PaginationArgs {
  page?: number;
  limit?: number;
  search?: string;
}

interface CreateCategoryInput {
  name: string;
  description: string;
}

interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

export const categoryResolvers = {
  Query: {
    categories: async (
      _parent: unknown,
      args: PaginationArgs,
      _context: GraphQLContext
    ) => {
      const page = args.page ?? 1;
      const limit = args.limit ?? 10;
      const search = args.search;

      const skip = (page - 1) * limit;

      // Build query
      const query: Record<string, unknown> = {};

      if (search) {
        query.$text = { $search: search };
      }

      const [categories, totalCount] = await Promise.all([
        Category.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Category.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        edges: categories,
        pageInfo: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    },

    category: async (
      _parent: unknown,
      { id }: { id: string },
      _context: GraphQLContext
    ) => {
      const category = await Category.findById(id);
      if (!category) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return category;
    },
  },

  Mutation: {
    createCategory: async (
      _parent: unknown,
      { input }: { input: CreateCategoryInput },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to create a category", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const category = new Category({
        name: input.name,
        description: input.description,
        createdBy: context.user,
      });

      await category.save();
      return category;
    },

    updateCategory: async (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateCategoryInput },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to update a category", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const category = await Category.findById(id);
      if (!category) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (input.name !== undefined) category.name = input.name;
      if (input.description !== undefined)
        category.description = input.description;

      await category.save();
      return category;
    },

    deleteCategory: async (
      _parent: unknown,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to delete a category", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Check if category is being used by any risks
      const risksUsingCategory = await Risk.countDocuments({
        categoryId: new mongoose.Types.ObjectId(id),
      });
      if (risksUsingCategory > 0) {
        throw new GraphQLError(
          `Cannot delete category. It is being used by ${risksUsingCategory} risk(s).`,
          {
            extensions: { code: "CONSTRAINT_VIOLATION" },
          }
        );
      }

      const result = await Category.findByIdAndDelete(id);
      return !!result;
    },
  },

  Category: {
    id: (parent: { _id: mongoose.Types.ObjectId }) => parent._id.toString(),
  },
};
