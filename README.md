# Resume AI Engine

A professional AI-powered resume builder built with React, Vite, Express, and Drizzle ORM.

## Features

- AI-powered content suggestion
- Sector-specific templates
- Live preview and real-time editing
- Secure user authentication

## Prerequisites

- **Node.js**: Version 20 or higher (Version 24 recommended)
- **pnpm**: Version 9 or higher

## Setup Instructions

### 1. Install Dependencies

Open your terminal in the root of the project and run:

```bash
pnpm install
```

### 2. Database Setup

The project uses SQLite with Drizzle ORM. You need to initialize the database schema and seed it with initial templates.

**Initialize Schema:**
```bash
pnpm --filter @workspace/db run push
```

**Seed Templates:**
```bash
pnpm --filter @workspace/db run seed
```

### 3. Running the Project

You need to run both the API server and the Frontend application simultaneously.

#### Start the API Server

In a new terminal window:
```bash
pnpm --filter @workspace/api-server run dev
```
The server will start on [http://localhost:8080](http://localhost:8080).

#### Start the Frontend Application

In another terminal window:
```bash
pnpm --filter @workspace/resume-builder run dev
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).

## Project Structure

- `artifacts/resume-builder`: Frontend application (React + Vite)
- `artifacts/api-server`: Backend API server (Express)
- `lib/db`: Database schema and migrations (Drizzle ORM)
- `lib/api-spec`: OpenAPI specifications and generated hooks

## Troubleshooting

- **Database Errors**: If you encounter issues with the database, ensure you have run the `push` and `seed` commands.
- **API Connection**: Verify that the API server is running on port 8080. The frontend proxies requests to this port.
