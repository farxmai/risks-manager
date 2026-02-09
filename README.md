# risks-manager

A full-stack Risks Manager with a GraphQL backend and a React frontend. It manages **Risks** and **Categories** and exposes GraphQL resolvers for CRUD-like operations.

## Features

- Manage risks and categories
- GraphQL API with resolvers
- React UI client

## Tech Stack

- Backend: Node.js + TypeScript + GraphQL
- Frontend: React + TypeScript + Vite
- Data models: [`models.Category`](backend/src/models/Category.ts), [`models.Risk`](backend/src/models/Risk.ts)

## Project Structure

- Backend entry: [backend/src/index.ts](backend/src/index.ts)
- GraphQL schema: [backend/src/schema.graphql](backend/src/schema.graphql)
- Resolvers: [backend/src/resolvers](backend/src/resolvers)
- Frontend app: [frontend/src/App.tsx](frontend/src/App.tsx)
- Apollo client: [frontend/src/apollo-client.ts](frontend/src/apollo-client.ts)

## Run Locally

> **Important:** Ensure MongoDB is running locally before starting the backend, LOL

### 1) Backend

```sh
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend

```sh
cd frontend
npm install
npm run dev
```

Open the Vite dev server URL printed in the terminal.

## Environment

Backend environment variables are defined in [.env.example](backend/.env.example). Copy to `.env` and adjust as needed.

## Notes

- If you change the GraphQL schema, update generated types using the codegen configuration in [backend/codegen.yml](backend/codegen.yml).
