import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Diagnosis } from '../diagnoses/entity/diagnosis.entity';
import { Appointment } from '../appointments/entity/appointment.entity';
import { AppointmentAnswer } from '../appointment-answers/entity/appointment-answer.entity';
import { Question } from '../questions/entity/question.entity';
import { AiEvaluation } from '../ai-evaluations/entity/ai-evaluation.entity';
import { PatientTreatment } from '../patient-treatments/entity/patient-treatment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Diagnosis,
      Appointment,
      AppointmentAnswer,
      Question,
      AiEvaluation,
      PatientTreatment,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

