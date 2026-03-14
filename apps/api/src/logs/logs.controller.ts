import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateLogItemDto } from './dto/create-log-item.dto';
import { DayLogResponseDto, LoggedItemDto } from './dto/day-log-response.dto';
import { GetDayQueryDto } from './dto/get-day-query.dto';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post('items')
  create(@Body() dto: CreateLogItemDto): Promise<LoggedItemDto> {
    return this.logsService.createLogItem(dto);
  }

  @Get('day')
  getDay(@Query() query: GetDayQueryDto): Promise<DayLogResponseDto> {
    return this.logsService.getDay(query.date);
  }
}
