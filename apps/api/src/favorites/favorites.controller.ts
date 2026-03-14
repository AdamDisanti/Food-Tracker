import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoriteFoodDto } from './dto/favorite-food.dto';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(): Promise<FavoriteFoodDto[]> {
    return this.favoritesService.getFavorites();
  }

  @Post()
  addFavorite(@Body() dto: CreateFavoriteDto): Promise<FavoriteFoodDto> {
    return this.favoritesService.addFavorite(dto.foodId);
  }

  @Delete(':foodId')
  @HttpCode(204)
  async removeFavorite(@Param('foodId') foodId: string): Promise<void> {
    await this.favoritesService.removeFavorite(foodId);
  }
}
