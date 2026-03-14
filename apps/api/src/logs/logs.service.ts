import { Injectable, NotFoundException } from '@nestjs/common';
import { MealGroup } from '@prisma/client';
import { FoodsService } from '../foods/foods.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogItemDto } from './dto/create-log-item.dto';
import { DayLogResponseDto, LoggedItemDto } from './dto/day-log-response.dto';

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

    return {
      id: item.id,
      foodId: item.foodId,
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
    };
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

    const mapped = dailyLog.mealLogItems.map<LoggedItemDto>((item) => ({
      id: item.id,
      foodId: item.foodId,
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
    }));

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
