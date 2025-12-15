import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AppointmentAnswersService } from './appointment-answers.service';
import { CreateAppointmentAnswerDto } from './dto/create-appointment-answer.dto';
import { UpdateAppointmentAnswerDto } from './dto/update-appointment-answer.dto';
import { CreateMultipleAnswersDto } from './dto/create-multiple-answers.dto';

@Controller('appointment-answers')
export class AppointmentAnswersController {
  constructor(private readonly appointmentAnswersService: AppointmentAnswersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAppointmentAnswerDto: CreateAppointmentAnswerDto) {
    return this.appointmentAnswersService.create(createAppointmentAnswerDto);
  }

  @Post('multiple')
  @HttpCode(HttpStatus.CREATED)
  createMultiple(@Body() createMultipleAnswersDto: CreateMultipleAnswersDto) {
    return this.appointmentAnswersService.createMultiple(createMultipleAnswersDto);
  }

  @Get()
  findAll(@Query('appointmentId') appointmentId?: string) {
    if (appointmentId) {
      return this.appointmentAnswersService.findByAppointment(parseInt(appointmentId));
    }
    return this.appointmentAnswersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentAnswersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentAnswerDto: UpdateAppointmentAnswerDto
  ) {
    return this.appointmentAnswersService.update(id, updateAppointmentAnswerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentAnswersService.remove(id);
  }
}

