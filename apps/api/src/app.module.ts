import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { FoodsModule } from './foods/foods.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, HealthModule, FoodsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
