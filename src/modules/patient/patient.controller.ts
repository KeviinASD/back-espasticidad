import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { JwtPayloadParams } from 'src/common/utils/types';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createPatientDto: CreatePatientDto,
    @ActiveUser() user: JwtPayloadParams
  ) {
    return this.patientService.create(createPatientDto, user.sub);
  }

  @Get()
  findAll(@ActiveUser() user: JwtPayloadParams) {
    return this.patientService.findAll(user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: JwtPayloadParams
  ) {
    return this.patientService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePatientDto: UpdatePatientDto,
    @ActiveUser() user: JwtPayloadParams
  ) {
    return this.patientService.update(id, updatePatientDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: JwtPayloadParams
  ) {
    return this.patientService.remove(id, user.sub);
  }
}
