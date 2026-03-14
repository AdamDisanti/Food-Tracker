import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const mealGroups = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;

// DTO for creating a single meal log item with nutrition snapshot persistence.
export class CreateLogItemDto {
  @IsString()
  foodId!: string;

  @IsString()
  @IsIn(mealGroups)
  mealGroup!: (typeof mealGroups)[number];

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(999)
  amount!: number;

  @IsString()
  servingUnit!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(5000)
  grams!: number;

  @IsOptional()
  @IsDateString()
  loggedAt?: string;

  @IsOptional()
  @IsDateString()
  logDate?: string;
}
