import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalsDto } from './dto/goals.dto';
import { UpsertGoalsDto } from './dto/upsert-goals.dto';

function mapGoalRecordToDto(goal: {
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  updatedAt: Date;
}): GoalsDto {
  return {
    calorieGoal: goal.calorieGoal,
    proteinGoal: goal.proteinGoal,
    carbGoal: goal.carbGoal,
    fatGoal: goal.fatGoal,
    updatedAt: goal.updatedAt.toISOString(),
  };
}

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGoals(): Promise<GoalsDto | null> {
    const goal = await this.prisma.nutritionGoal.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!goal) {
      return null;
    }

    return mapGoalRecordToDto(goal);
  }

  async upsertGoals(input: UpsertGoalsDto): Promise<GoalsDto> {
    const current = await this.prisma.nutritionGoal.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
    });

    const saved = current
      ? await this.prisma.nutritionGoal.update({
          where: { id: current.id },
          data: {
            calorieGoal: input.calorieGoal,
            proteinGoal: input.proteinGoal,
            carbGoal: input.carbGoal,
            fatGoal: input.fatGoal,
          },
        })
      : await this.prisma.nutritionGoal.create({
          data: {
            calorieGoal: input.calorieGoal,
            proteinGoal: input.proteinGoal,
            carbGoal: input.carbGoal,
            fatGoal: input.fatGoal,
          },
        });

    return mapGoalRecordToDto(saved);
  }
}
