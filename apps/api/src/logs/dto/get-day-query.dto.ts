import { IsDateString } from 'class-validator';

export class GetDayQueryDto {
  @IsDateString()
  date!: string;
}
