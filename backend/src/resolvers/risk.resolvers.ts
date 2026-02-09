import { GraphQLError } from "graphql";
import { Risk, RiskStatus } from "../models/Risk";
import { Category } from "../models/Category";
import { GraphQLContext } from "../context";
import mongoose from "mongoose";

interface PaginationArgs {
  page?: number;
  limit?: number;
}

interface RisksQueryArgs extends PaginationArgs {
  showResolved?: boolean;
  search?: string;
}

interface CreateRiskInput {
  name: string;
  description: string;
  categoryId: string;
  status?: RiskStatus;
}

interface UpdateRiskInput {
  name?: string;
  description?: string;
  categoryId?: string;
  status?: RiskStatus;
}

export const riskResolvers = {
  Query: {
    risks: async (
      _parent: unknown,
      args: RisksQueryArgs,
      _context: GraphQLContext,
    ) => {
      const page = args.page ?? 1;
      const limit = args.limit ?? 10;
      const showResolved = args.showResolved ?? true;
      const search = args.search;

      const skip = (page - 1) * limit;

      // Build query
      const query: Record<string, unknown> = {};

      if (!showResolved) {
        query.status = RiskStatus.UNRESOLVED;
      }

      if (search) {
        query.$text = { $search: search };
      }

      const [risks, totalCount] = await Promise.all([
        Risk.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Risk.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        edges: risks,
        pageInfo: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    },
  },

  Mutation: {
    createRisk: async (
      _parent: unknown,
      { input }: { input: CreateRiskInput },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to create a risk", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Validate category exists
      const category = await Category.findById(input.categoryId);
      if (!category) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const risk = new Risk({
        name: input.name,
        description: input.description,
        categoryId: new mongoose.Types.ObjectId(input.categoryId),
        status: input.status ?? RiskStatus.UNRESOLVED,
        createdBy: context.user,
      });

      await risk.save();
      return risk;
    },

    updateRisk: async (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateRiskInput },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to update a risk", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const risk = await Risk.findById(id);
      if (!risk) {
        throw new GraphQLError("Risk not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // Validate category if it's being updated
      if (input.categoryId) {
        const category = await Category.findById(input.categoryId);
        if (!category) {
          throw new GraphQLError("Category not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
        risk.categoryId = new mongoose.Types.ObjectId(input.categoryId);
      }

      if (input.name !== undefined) risk.name = input.name;
      if (input.description !== undefined) risk.description = input.description;
      if (input.status !== undefined) risk.status = input.status;

      await risk.save();
      return risk;
    },

    deleteRisk: async (
      _parent: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to delete a risk", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const result = await Risk.findByIdAndDelete(id);
      return !!result;
    },
  },

  Risk: {
    id: (parent: { _id: mongoose.Types.ObjectId }) => parent._id.toString(),
    category: async (
      parent: { categoryId: mongoose.Types.ObjectId },
      _args: unknown,
      context: GraphQLContext,
    ) => {
      // Use DataLoader to resolve category (solves N+1 problem)
      const category = await context.categoryLoader.load(
        parent.categoryId.toString(),
      );
      if (!category) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return category;
    },
  },
};
