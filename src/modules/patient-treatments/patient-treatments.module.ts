import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientTreatmentsService } from './patient-treatments.service';
import { PatientTreatmentsController } from './patient-treatments.controller';
import { PatientTreatment } from './entity/patient-treatment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientTreatment])],
  controllers: [PatientTreatmentsController],
  providers: [PatientTreatmentsService],
  exports: [PatientTreatmentsService],
})
export class PatientTreatmentsModule {}

