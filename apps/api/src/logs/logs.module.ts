import { Module } from '@nestjs/common';
import { FoodsModule } from '../foods/foods.module';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

@Module({
  imports: [FoodsModule],
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {}
