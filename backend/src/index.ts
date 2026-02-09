import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";
import { connectDB } from "./db";
import { resolvers } from "./resolvers";
import { createCategoryLoader, GraphQLContext } from "./context";

dotenv.config();

const typeDefs = readFileSync(join(__dirname, "schema.graphql"), "utf-8");

async function startServer(): Promise<void> {
  const app = express();

  const PORT = process.env.PORT ?? 4000;
  const MONGODB_URI =
    process.env.MONGODB_URI ?? "mongodb://localhost:27017/risks-manager";

  await connectDB(MONGODB_URI);

  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    formatError: (formattedError, error) => {
      console.error("GraphQL Error:", error);
      return formattedError;
    },
  });

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: ["http://localhost:5173", "http://localhost:3000"],
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const user = req.headers["x-user"] as string | undefined;

        return {
          user: user ?? null,
          categoryLoader: createCategoryLoader(),
        };
      },
    }),
  );

  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
