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

/**
 * DTO for editing a previously logged item.
 *
 * Food choice remains fixed in this milestone to keep edit interactions simple.
 * Users can update meal group, amount/unit, grams, and timestamp.
 */
export class UpdateLogItemDto {
  @IsOptional()
  @IsString()
  @IsIn(mealGroups)
  mealGroup?: (typeof mealGroups)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(999)
  amount?: number;

  @IsOptional()
  @IsString()
  servingUnit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(5000)
  grams?: number;

  @IsOptional()
  @IsDateString()
  loggedAt?: string;
}
