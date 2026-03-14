import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { FoodDetailDto } from './dto/food-detail.dto';
import { FoodSummaryDto } from './dto/food-summary.dto';
import { SearchFoodsQueryDto } from './dto/search-foods-query.dto';
import { FoodsService } from './foods.service';

@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get('search')
  search(@Query() query: SearchFoodsQueryDto): Promise<FoodSummaryDto[]> {
    const limit = query.limit ?? 20;
    return this.foodsService.searchFoods(query.q, limit);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<FoodDetailDto> {
    return this.foodsService.getFoodById(id);
  }

  // Optional internal endpoint for proactively importing a USDA item into cache.
  @Post('import/usda/:fdcId')
  importUsda(
    @Param('fdcId', ParseIntPipe) fdcId: number,
  ): Promise<FoodDetailDto> {
    return this.foodsService.importUsdaFood(String(fdcId));
  }
}
