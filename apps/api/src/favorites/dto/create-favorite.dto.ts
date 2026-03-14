import { IsString } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  foodId!: string;
}
