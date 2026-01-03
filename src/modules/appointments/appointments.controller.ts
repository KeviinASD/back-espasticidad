import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from './entity/appointment.entity';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { JwtPayloadParams } from 'src/common/utils/types';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get('upcoming')
  @ApiOperation({ 
    summary: 'Obtener citas próximas del doctor autenticado',
    description: 'Retorna las citas próximas del doctor autenticado ordenadas por fecha (las más cercanas primero). Solo incluye citas con estado SCHEDULED o IN_PROGRESS.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de citas próximas del doctor',
  })
  findUpcomingByDoctor(@ActiveUser() user: JwtPayloadParams) {
    return this.appointmentsService.findUpcomingByDoctor(user.sub);
  }

  @Get()
  findAll(
    @Query('patientTreatmentId') patientTreatmentId?: string,
    @Query('status') status?: AppointmentStatus,
    @ActiveUser() user?: JwtPayloadParams
  ) {
    if (patientTreatmentId) {
      return this.appointmentsService.findByPatientTreatment(parseInt(patientTreatmentId), user?.sub);
    }
    if (status) {
      return this.appointmentsService.findByStatus(status, user?.sub);
    }
    return this.appointmentsService.findAll(user?.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: JwtPayloadParams
  ) {
    return this.appointmentsService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @ActiveUser() user: JwtPayloadParams
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: JwtPayloadParams
  ) {
    return this.appointmentsService.remove(id, user.sub);
  }
}

