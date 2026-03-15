import { Injectable, NotFoundException } from '@nestjs/common';
import { MealGroup } from '@prisma/client';
import { FoodsService } from '../foods/foods.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogItemDto } from './dto/create-log-item.dto';
import { DayLogResponseDto, LoggedItemDto } from './dto/day-log-response.dto';
import { UpdateLogItemDto } from './dto/update-log-item.dto';

function toStartOfDay(dateLike: string | Date): Date {
  const date = new Date(dateLike);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function toRounded(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeFoodLookupId(foodId: string): {
  sourceId: string;
  localId: string | null;
} {
  if (foodId.startsWith('usda:')) {
    return { sourceId: foodId.replace('usda:', ''), localId: null };
  }

  return { sourceId: foodId, localId: foodId };
}

/**
 * Shared mapper keeps response shape consistent between create/update/day endpoints.
 */
function mapMealLogItemToDto(item: {
  id: string;
  foodId: string;
  mealGroup: MealGroup;
  amount: number;
  servingUnit: string;
  grams: number;
  loggedAt: Date;
  caloriesSnapshot: number;
  proteinSnapshot: number;
  carbsSnapshot: number;
  fatSnapshot: number;
  food: {
    name: string;
    sourceId: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    defaultServingAmount: number | null;
  };
}): LoggedItemDto {
  return {
    id: item.id,
    foodId: item.foodId,
    foodSourceId: item.food.sourceId,
    foodName: item.food.name,
    mealGroup: item.mealGroup,
    amount: item.amount,
    servingUnit: item.servingUnit,
    grams: item.grams,
    loggedAt: item.loggedAt.toISOString(),
    calories: item.caloriesSnapshot,
    protein: item.proteinSnapshot,
    carbs: item.carbsSnapshot,
    fat: item.fatSnapshot,
    caloriesPer100g: item.food.caloriesPer100g,
    proteinPer100g: item.food.proteinPer100g,
    carbsPer100g: item.food.carbsPer100g,
    fatPer100g: item.food.fatPer100g,
    defaultServingAmount: item.food.defaultServingAmount,
  };
}

@Injectable()
export class LogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly foodsService: FoodsService,
  ) {}

  async createLogItem(input: CreateLogItemDto): Promise<LoggedItemDto> {
    const loggedAt = input.loggedAt ? new Date(input.loggedAt) : new Date();
    const date = input.logDate
      ? toStartOfDay(input.logDate)
      : toStartOfDay(loggedAt);

    const mealGroup = input.mealGroup as MealGroup;

    const { sourceId, localId } = normalizeFoodLookupId(input.foodId);

    let food =
      localId === null
        ? null
        : await this.prisma.food.findUnique({
            where: { id: localId },
          });

    if (!food) {
      food = await this.prisma.food.findUnique({
        where: { source_sourceId: { source: 'usda', sourceId } },
      });
    }

    if (!food) {
      // If not cached yet and source id is numeric, import from USDA and retry.
      if (/^\d+$/.test(sourceId)) {
        await this.foodsService.importUsdaFood(sourceId);
        food = await this.prisma.food.findUnique({
          where: { source_sourceId: { source: 'usda', sourceId } },
        });
      }
    }

    if (!food) {
      throw new NotFoundException(`Food '${input.foodId}' was not found.`);
    }

    const factor = input.grams / 100;
    const calories = toRounded(food.caloriesPer100g * factor);
    const protein = toRounded(food.proteinPer100g * factor);
    const carbs = toRounded(food.carbsPer100g * factor);
    const fat = toRounded(food.fatPer100g * factor);

    const dailyLog = await this.prisma.dailyLog.upsert({
      where: { logDate: date },
      update: {},
      create: { logDate: date },
    });

    const item = await this.prisma.mealLogItem.create({
      data: {
        dailyLogId: dailyLog.id,
        foodId: food.id,
        mealGroup,
        amount: input.amount,
        servingUnit: input.servingUnit,
        grams: input.grams,
        loggedAt,
        caloriesSnapshot: calories,
        proteinSnapshot: protein,
        carbsSnapshot: carbs,
        fatSnapshot: fat,
      },
      include: {
        food: true,
      },
    });

    return mapMealLogItemToDto(item);
  }

  async updateLogItem(
    id: string,
    input: UpdateLogItemDto,
  ): Promise<LoggedItemDto> {
    const existing = await this.prisma.mealLogItem.findUnique({
      where: { id },
      include: { food: true },
    });

    if (!existing) {
      throw new NotFoundException(`Log item '${id}' was not found.`);
    }

    // Use current values as defaults so callers can patch only changed fields.
    const nextMealGroup =
      (input.mealGroup as MealGroup | undefined) ?? existing.mealGroup;
    const nextAmount = input.amount ?? existing.amount;
    const nextServingUnit = input.servingUnit ?? existing.servingUnit;
    const nextGrams = input.grams ?? existing.grams;
    const nextLoggedAt = input.loggedAt
      ? new Date(input.loggedAt)
      : existing.loggedAt;

    // Keep snapshot math aligned with create flow and current food nutrition values.
    const factor = nextGrams / 100;
    const calories = toRounded(existing.food.caloriesPer100g * factor);
    const protein = toRounded(existing.food.proteinPer100g * factor);
    const carbs = toRounded(existing.food.carbsPer100g * factor);
    const fat = toRounded(existing.food.fatPer100g * factor);

    const updated = await this.prisma.mealLogItem.update({
      where: { id },
      data: {
        mealGroup: nextMealGroup,
        amount: nextAmount,
        servingUnit: nextServingUnit,
        grams: nextGrams,
        loggedAt: nextLoggedAt,
        caloriesSnapshot: calories,
        proteinSnapshot: protein,
        carbsSnapshot: carbs,
        fatSnapshot: fat,
      },
      include: { food: true },
    });

    return mapMealLogItemToDto(updated);
  }

  async deleteLogItem(id: string): Promise<void> {
    const existing = await this.prisma.mealLogItem.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Log item '${id}' was not found.`);
    }

    await this.prisma.mealLogItem.delete({ where: { id } });
  }

  async getDay(dateString: string): Promise<DayLogResponseDto> {
    const date = toStartOfDay(dateString);

    const dailyLog = await this.prisma.dailyLog.findUnique({
      where: { logDate: date },
      include: {
        mealLogItems: {
          include: {
            food: true,
          },
          orderBy: {
            loggedAt: 'asc',
          },
        },
      },
    });

    if (!dailyLog) {
      return {
        date: date.toISOString().slice(0, 10),
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
        },
      };
    }

    const mapped =
      dailyLog.mealLogItems.map<LoggedItemDto>(mapMealLogItemToDto);

    const totals = mapped.reduce(
      (acc, item) => ({
        calories: toRounded(acc.calories + item.calories),
        protein: toRounded(acc.protein + item.protein),
        carbs: toRounded(acc.carbs + item.carbs),
        fat: toRounded(acc.fat + item.fat),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    return {
      date: date.toISOString().slice(0, 10),
      totals,
      meals: {
        breakfast: mapped.filter((item) => item.mealGroup === 'breakfast'),
        lunch: mapped.filter((item) => item.mealGroup === 'lunch'),
        dinner: mapped.filter((item) => item.mealGroup === 'dinner'),
        snacks: mapped.filter((item) => item.mealGroup === 'snacks'),
      },
    };
  }
}
