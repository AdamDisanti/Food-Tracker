# Food Tracker Monorepo

## Apps
- `apps/mobile` - Expo React Native app
- `apps/api` - NestJS backend

## Packages
- `packages/shared-types` - shared TypeScript types

## Quick start
1. Install dependencies: `npm install`
2. Copy API env file if needed: `cp apps/api/.env.example apps/api/.env`
	- Add your USDA key to `apps/api/.env` as `USDA_API_KEY=...`
3. Start PostgreSQL (Docker): `npm run db:up`
4. Apply Prisma migration to local DB: `npm run db:migrate`
5. Start API: `npm run dev:api`
6. Start mobile: `npm run dev:mobile`

## Validate setup
- `npm run lint`
- `npm run build`

## Milestone 0 status
- Monorepo scaffolded
- Expo and NestJS apps scaffolded
- Prisma configured in API app
- CI lint/build workflow configured
- Postgres Docker compose configured

## Milestone 2 API routes
- `GET /foods/search?q=chicken&limit=20`
- `GET /foods/:id` (supports cached id or USDA FDC id)
- `POST /foods/import/usda/:fdcId` (optional cache import route)
