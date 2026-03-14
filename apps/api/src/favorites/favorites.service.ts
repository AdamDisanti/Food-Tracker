import { Injectable, NotFoundException } from '@nestjs/common';
import { Food } from '@prisma/client';
import { FoodsService } from '../foods/foods.service';
import { PrismaService } from '../prisma/prisma.service';
import { FavoriteFoodDto } from './dto/favorite-food.dto';

function normalizeFoodLookupId(foodId: string): {
  sourceId: string;
  localId: string | null;
} {
  if (foodId.startsWith('usda:')) {
    return { sourceId: foodId.replace('usda:', ''), localId: null };
  }

  return { sourceId: foodId, localId: foodId };
}

function mapFavoriteFoodToDto(record: {
  id: string;
  createdAt: Date;
  food: Food;
}): FavoriteFoodDto {
  return {
    id: record.id,
    foodId: record.food.id,
    sourceId: record.food.sourceId,
    name: record.food.name,
    brand: record.food.brand,
    caloriesPer100g: record.food.caloriesPer100g,
    lastUsedAmount: record.food.defaultServingAmount,
    lastUsedServingUnit: record.food.defaultServingUnit,
    createdAt: record.createdAt.toISOString(),
  };
}

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly foodsService: FoodsService,
  ) {}

  async getFavorites(): Promise<FavoriteFoodDto[]> {
    const items = await this.prisma.favoriteFood.findMany({
      include: { food: true },
      orderBy: { createdAt: 'desc' },
    });

    return items.map(mapFavoriteFoodToDto);
  }

  async addFavorite(foodId: string): Promise<FavoriteFoodDto> {
    const food = await this.resolveFood(foodId);

    const favorite = await this.prisma.favoriteFood.upsert({
      where: { foodId: food.id },
      update: {},
      create: { foodId: food.id },
      include: { food: true },
    });

    return mapFavoriteFoodToDto(favorite);
  }

  async removeFavorite(foodId: string): Promise<void> {
    const { sourceId, localId } = normalizeFoodLookupId(foodId);

    if (localId) {
      await this.prisma.favoriteFood.deleteMany({
        where: {
          OR: [{ foodId: localId }, { food: { source: 'usda', sourceId } }],
        },
      });
      return;
    }

    await this.prisma.favoriteFood.deleteMany({
      where: { food: { source: 'usda', sourceId } },
    });
  }

  private async resolveFood(foodId: string): Promise<Food> {
    const { sourceId, localId } = normalizeFoodLookupId(foodId);

    let food = localId
      ? await this.prisma.food.findUnique({ where: { id: localId } })
      : null;

    if (!food) {
      food = await this.prisma.food.findUnique({
        where: { source_sourceId: { source: 'usda', sourceId } },
      });
    }

    if (!food && /^\d+$/.test(sourceId)) {
      await this.foodsService.importUsdaFood(sourceId);
      food = await this.prisma.food.findUnique({
        where: { source_sourceId: { source: 'usda', sourceId } },
      });
    }

    if (!food) {
      throw new NotFoundException(`Food '${foodId}' was not found.`);
    }

    return food;
  }
}
