import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { Patient } from './entity/patient.entity';
import { PatientTreatment } from '../patient-treatments/entity/patient-treatment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, PatientTreatment])],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
