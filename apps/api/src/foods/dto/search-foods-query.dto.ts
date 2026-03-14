import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// Query DTO for validating and shaping /foods/search request parameters.
export class SearchFoodsQueryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  q!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
