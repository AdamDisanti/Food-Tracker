import { Module } from '@nestjs/common';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';
import { UsdaClient } from './usda/usda.client';

@Module({
  controllers: [FoodsController],
  providers: [FoodsService, UsdaClient],
  exports: [FoodsService],
})
export class FoodsModule {}
