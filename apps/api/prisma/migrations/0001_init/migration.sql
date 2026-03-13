-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MealGroup" AS ENUM ('breakfast', 'lunch', 'dinner', 'snacks');

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "source" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "defaultServingUnit" TEXT,
    "defaultServingAmount" DOUBLE PRECISION,
    "caloriesPer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "carbsPer100g" DOUBLE PRECISION NOT NULL,
    "fatPer100g" DOUBLE PRECISION NOT NULL,
    "rawPayloadJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodServing" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "gramEquivalent" DOUBLE PRECISION NOT NULL,
    "amountLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodServing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealLogItem" (
    "id" TEXT NOT NULL,
    "dailyLogId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "mealGroup" "MealGroup" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "servingUnit" TEXT NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL,
    "caloriesSnapshot" DOUBLE PRECISION NOT NULL,
    "proteinSnapshot" DOUBLE PRECISION NOT NULL,
    "carbsSnapshot" DOUBLE PRECISION NOT NULL,
    "fatSnapshot" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealLogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionGoal" (
    "id" TEXT NOT NULL,
    "calorieGoal" DOUBLE PRECISION NOT NULL,
    "proteinGoal" DOUBLE PRECISION NOT NULL,
    "carbGoal" DOUBLE PRECISION NOT NULL,
    "fatGoal" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteFood" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteFood_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Food_name_idx" ON "Food"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Food_source_sourceId_key" ON "Food"("source", "sourceId");

-- CreateIndex
CREATE INDEX "FoodServing_foodId_idx" ON "FoodServing"("foodId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_logDate_key" ON "DailyLog"("logDate");

-- CreateIndex
CREATE INDEX "MealLogItem_dailyLogId_idx" ON "MealLogItem"("dailyLogId");

-- CreateIndex
CREATE INDEX "MealLogItem_foodId_idx" ON "MealLogItem"("foodId");

-- CreateIndex
CREATE INDEX "MealLogItem_mealGroup_idx" ON "MealLogItem"("mealGroup");

-- CreateIndex
CREATE INDEX "MealLogItem_loggedAt_idx" ON "MealLogItem"("loggedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteFood_foodId_key" ON "FavoriteFood"("foodId");

-- AddForeignKey
ALTER TABLE "FoodServing" ADD CONSTRAINT "FoodServing_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLogItem" ADD CONSTRAINT "MealLogItem_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLogItem" ADD CONSTRAINT "MealLogItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteFood" ADD CONSTRAINT "FavoriteFood_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

