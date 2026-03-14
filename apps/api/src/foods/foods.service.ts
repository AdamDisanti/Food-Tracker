import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FoodDetailDto } from './dto/food-detail.dto';
import { FoodSummaryDto } from './dto/food-summary.dto';
import {
  mapCachedFoodToDetail,
  mapUsdaDetailToDto,
  mapUsdaSearchItemToSummary,
} from './foods.mapper';
import { UsdaClient } from './usda/usda.client';

@Injectable()
export class FoodsService {
  constructor(
    private readonly usdaClient: UsdaClient,
    private readonly prisma: PrismaService,
  ) {}

  // Searches USDA live and returns normalized summary records for app consumption.
  async searchFoods(query: string, limit = 20): Promise<FoodSummaryDto[]> {
    const response = await this.usdaClient.searchFoods(query, limit);
    return (response.foods ?? []).map(mapUsdaSearchItemToSummary);
  }

  // Finds food detail from cache first; falls back to USDA by source id if needed.
  async getFoodById(id: string): Promise<FoodDetailDto> {
    const cachedByLocalId = await this.prisma.food.findUnique({
      where: { id },
      include: { servings: true },
    });

    if (cachedByLocalId) {
      return mapCachedFoodToDetail(cachedByLocalId);
    }

    const cachedBySource = await this.prisma.food.findUnique({
      where: { source_sourceId: { source: 'usda', sourceId: id } },
      include: { servings: true },
    });

    if (cachedBySource) {
      return mapCachedFoodToDetail(cachedBySource);
    }

    if (!/^\d+$/.test(id)) {
      throw new NotFoundException(
        `Food '${id}' was not found in cache and is not a USDA FDC id.`,
      );
    }

    const detail = mapUsdaDetailToDto(await this.usdaClient.getFoodDetail(id));
    await this.cacheFoodDetail(detail);
    return detail;
  }

  // Internal helper for optional explicit import endpoint.
  async importUsdaFood(fdcId: string): Promise<FoodDetailDto> {
    const detail = mapUsdaDetailToDto(
      await this.usdaClient.getFoodDetail(fdcId),
    );
    await this.cacheFoodDetail(detail);
    return detail;
  }

  private async cacheFoodDetail(food: FoodDetailDto): Promise<void> {
    await this.prisma.food.upsert({
      where: {
        source_sourceId: {
          source: 'usda',
          sourceId: food.sourceId,
        },
      },
      update: {
        name: food.name,
        brand: food.brand,
        defaultServingUnit: food.defaultServingUnit,
        defaultServingAmount: food.defaultServingAmount,
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g,
        carbsPer100g: food.carbsPer100g,
        fatPer100g: food.fatPer100g,
      },
      create: {
        name: food.name,
        brand: food.brand,
        source: 'usda',
        sourceId: food.sourceId,
        defaultServingUnit: food.defaultServingUnit,
        defaultServingAmount: food.defaultServingAmount,
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g,
        carbsPer100g: food.carbsPer100g,
        fatPer100g: food.fatPer100g,
      },
    });

    const persisted = await this.prisma.food.findUnique({
      where: {
        source_sourceId: {
          source: 'usda',
          sourceId: food.sourceId,
        },
      },
    });

    if (!persisted) {
      return;
    }

    // Replace serving options to keep cache synchronized with latest USDA detail payload.
    await this.prisma.$transaction([
      this.prisma.foodServing.deleteMany({ where: { foodId: persisted.id } }),
      this.prisma.foodServing.createMany({
        data: food.servings.map((serving) => ({
          foodId: persisted.id,
          unitName: serving.unitName,
          gramEquivalent: serving.gramEquivalent,
          amountLabel: serving.amountLabel,
        })),
      }),
    ]);
  }
}
