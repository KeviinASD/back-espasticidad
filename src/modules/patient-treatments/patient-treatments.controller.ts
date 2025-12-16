import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { PatientTreatmentsService } from './patient-treatments.service';
import { CreatePatientTreatmentDto } from './dto/create-patient-treatment.dto';
import { UpdatePatientTreatmentDto } from './dto/update-patient-treatment.dto';

@ApiTags('Patient Treatments')
@Controller('patient-treatments')
export class PatientTreatmentsController {
  constructor(private readonly patientTreatmentsService: PatientTreatmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear un nuevo tratamiento para un paciente',
    description: 'Asigna un tratamiento específico a un paciente con un médico responsable' 
  })
  @ApiBody({ type: CreatePatientTreatmentDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Tratamiento de paciente creado exitosamente',
    schema: {
      example: {
        patientTreatmentId: 1,
        patientId: 1,
        doctorId: 1,
        treatmentId: 1,
        startDate: '2024-01-15',
        endDate: '2024-06-15'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createPatientTreatmentDto: CreatePatientTreatmentDto) {
    return this.patientTreatmentsService.create(createPatientTreatmentDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los tratamientos de pacientes',
    description: 'Retorna lista de tratamientos con filtros opcionales por paciente y/o médico' 
  })
  @ApiQuery({ 
    name: 'patientId', 
    required: false, 
    description: 'Filtrar por ID de paciente',
    type: Number,
    example: 1
  })
  @ApiQuery({ 
    name: 'doctorId', 
    required: false, 
    description: 'Filtrar por ID de médico',
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de tratamientos obtenida exitosamente',
    schema: {
      example: [
        {
          patientTreatmentId: 1,
          patientId: 1,
          doctorId: 1,
          treatmentId: 1,
          startDate: '2024-01-15',
          endDate: '2024-06-15',
          patient: { patientId: 1, fullName: 'María González' },
          doctor: { id: 1, fullName: 'Dr. Juan Pérez' },
          treatment: { treatmentId: 1, treatmentName: 'Fisioterapia' }
        }
      ]
    }
  })
  findAll(@Query('patientId') patientId?: string, @Query('doctorId') doctorId?: string) {
    const filters: { patientId?: number; doctorId?: number } = {};
    
    if (patientId) {
      filters.patientId = parseInt(patientId);
    }
    if (doctorId) {
      filters.doctorId = parseInt(doctorId);
    }
    
    return this.patientTreatmentsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener un tratamiento de paciente por ID',
    description: 'Retorna los detalles completos del tratamiento incluyendo relaciones' 
  })
  @ApiParam({ name: 'id', description: 'ID del tratamiento de paciente', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Tratamiento encontrado',
    schema: {
      example: {
        patientTreatmentId: 1,
        patientId: 1,
        doctorId: 1,
        treatmentId: 1,
        startDate: '2024-01-15',
        endDate: '2024-06-15',
        patient: { patientId: 1, fullName: 'María González' },
        doctor: { id: 1, fullName: 'Dr. Juan Pérez' },
        treatment: { treatmentId: 1, treatmentName: 'Fisioterapia' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientTreatmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar un tratamiento de paciente',
    description: 'Actualiza los datos de un tratamiento existente' 
  })
  @ApiParam({ name: 'id', description: 'ID del tratamiento de paciente', type: Number })
  @ApiBody({ type: UpdatePatientTreatmentDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Tratamiento actualizado exitosamente',
    schema: {
      example: {
        patientTreatmentId: 1,
        patientId: 1,
        doctorId: 1,
        treatmentId: 1,
        startDate: '2024-01-15',
        endDate: '2024-07-15'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePatientTreatmentDto: UpdatePatientTreatmentDto
  ) {
    return this.patientTreatmentsService.update(id, updatePatientTreatmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar un tratamiento de paciente',
    description: 'Elimina permanentemente un tratamiento de paciente del sistema' 
  })
  @ApiParam({ name: 'id', description: 'ID del tratamiento de paciente', type: Number })
  @ApiResponse({ status: 204, description: 'Tratamiento eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientTreatmentsService.remove(id);
  }
}

