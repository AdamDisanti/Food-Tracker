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
