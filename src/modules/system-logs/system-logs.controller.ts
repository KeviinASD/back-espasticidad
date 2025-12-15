import { Controller, Get, Post, Body, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { CreateSystemLogDto } from './dto/create-system-log.dto';

@Controller('system-logs')
export class SystemLogsController {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSystemLogDto: CreateSystemLogDto) {
    return this.systemLogsService.create(createSystemLogDto);
  }

  @Get()
  findAll(@Query('doctorId') doctorId?: string) {
    if (doctorId) {
      return this.systemLogsService.findByDoctor(parseInt(doctorId));
    }
    return this.systemLogsService.findAll();
  }
}

