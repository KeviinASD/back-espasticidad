import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from './entity/appointment.entity';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get('doctor/:doctorId/upcoming')
  @ApiOperation({ 
    summary: 'Obtener citas próximas de un doctor',
    description: 'Retorna las citas próximas del doctor ordenadas por fecha (las más cercanas primero). Solo incluye citas con estado SCHEDULED o IN_PROGRESS.' 
  })
  @ApiParam({ 
    name: 'doctorId', 
    description: 'ID del doctor (usuario)', 
    type: Number,
    example: 1 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de citas próximas del doctor',
    schema: {
      example: [
        {
          appointmentId: 1,
          patientTreatmentId: 1,
          appointmentDate: '2024-12-20T10:00:00.000Z',
          status: 'SCHEDULED',
          progressPercentage: null,
          notes: null,
          patientTreatment: {
            patientTreatmentId: 1,
            patientId: 1,
            doctorId: 1,
            treatmentId: 1,
            patient: {
              patientId: 1,
              fullName: 'María González',
              birthDate: '1985-05-15'
            },
            doctor: {
              id: 1,
              fullName: 'Dr. Juan Pérez',
              email: 'juan.perez@example.com'
            },
            treatment: {
              treatmentId: 1,
              treatmentName: 'Fisioterapia para Espasticidad'
            }
          }
        },
        {
          appointmentId: 3,
          patientTreatmentId: 2,
          appointmentDate: '2024-12-21T14:00:00.000Z',
          status: 'IN_PROGRESS',
          progressPercentage: 50,
          notes: 'Paciente muestra mejora',
          patientTreatment: {
            patientTreatmentId: 2,
            patientId: 2,
            doctorId: 1,
            treatmentId: 1,
            patient: {
              patientId: 2,
              fullName: 'Carlos López',
              birthDate: '1990-03-20'
            },
            doctor: {
              id: 1,
              fullName: 'Dr. Juan Pérez',
              email: 'juan.perez@example.com'
            },
            treatment: {
              treatmentId: 1,
              treatmentName: 'Fisioterapia para Espasticidad'
            }
          }
        }
      ]
    }
  })
  findUpcomingByDoctor(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.appointmentsService.findUpcomingByDoctor(doctorId);
  }

  @Get()
  findAll(
    @Query('patientTreatmentId') patientTreatmentId?: string,
    @Query('status') status?: AppointmentStatus
  ) {
    if (patientTreatmentId) {
      return this.appointmentsService.findByPatientTreatment(parseInt(patientTreatmentId));
    }
    if (status) {
      return this.appointmentsService.findByStatus(status);
    }
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.remove(id);
  }
}

