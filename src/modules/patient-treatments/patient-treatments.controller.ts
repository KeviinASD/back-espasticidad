import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PatientTreatmentsService } from './patient-treatments.service';
import { CreatePatientTreatmentDto } from './dto/create-patient-treatment.dto';
import { UpdatePatientTreatmentDto } from './dto/update-patient-treatment.dto';

@Controller('patient-treatments')
export class PatientTreatmentsController {
  constructor(private readonly patientTreatmentsService: PatientTreatmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPatientTreatmentDto: CreatePatientTreatmentDto) {
    return this.patientTreatmentsService.create(createPatientTreatmentDto);
  }

  @Get()
  findAll(@Query('patientId') patientId?: string, @Query('doctorId') doctorId?: string) {
    if (patientId) {
      return this.patientTreatmentsService.findByPatient(parseInt(patientId));
    }
    if (doctorId) {
      return this.patientTreatmentsService.findByDoctor(parseInt(doctorId));
    }
    return this.patientTreatmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientTreatmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePatientTreatmentDto: UpdatePatientTreatmentDto
  ) {
    return this.patientTreatmentsService.update(id, updatePatientTreatmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientTreatmentsService.remove(id);
  }
}

