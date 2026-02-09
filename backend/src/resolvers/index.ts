import { riskResolvers } from "./risk.resolvers";
import { categoryResolvers } from "./category.resolvers";

export const resolvers = {
  Query: {
    ...riskResolvers.Query,
    ...categoryResolvers.Query,
  },
  Mutation: {
    ...riskResolvers.Mutation,
    ...categoryResolvers.Mutation,
  },
  Risk: riskResolvers.Risk,
  Category: categoryResolvers.Category,
};
