import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

// MVP single-user goals payload for calories and macros.
export class UpsertGoalsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10000)
  calorieGoal!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  proteinGoal!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  carbGoal!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  fatGoal!: number;
}
