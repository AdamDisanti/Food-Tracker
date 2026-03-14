import { Body, Controller, Get, Put } from '@nestjs/common';
import { GoalsDto } from './dto/goals.dto';
import { UpsertGoalsDto } from './dto/upsert-goals.dto';
import { GoalsService } from './goals.service';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  getGoals(): Promise<GoalsDto | null> {
    return this.goalsService.getGoals();
  }

  @Put()
  upsertGoals(@Body() dto: UpsertGoalsDto): Promise<GoalsDto> {
    return this.goalsService.upsertGoals(dto);
  }
}
