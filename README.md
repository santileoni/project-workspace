# Project Workspace

Aplicación compacta de gestión de proyectos construida con Next.js, TypeScript, Prisma y Postgres.

## Stack

- Next.js App Router
- TypeScript
- Prisma
- Postgres via Docker Compose
- Vitest

## Setup local

```bash
cp .env.example .env
npm install
docker compose up -d --wait
npm run db:migrate
npm run db:seed
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Comandos útiles:

```bash
npm run typecheck
npm test
```
