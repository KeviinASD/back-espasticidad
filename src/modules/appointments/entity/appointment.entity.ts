import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { PatientTreatment } from '../../patient-treatments/entity/patient-treatment.entity';
import { Diagnosis } from '../../diagnoses/entity/diagnosis.entity';
import { AppointmentAnswer } from '../../appointment-answers/entity/appointment-answer.entity';
import { AiEvaluation } from '../../ai-evaluations/entity/ai-evaluation.entity';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn({ name: 'appointment_id' })
  appointmentId: number;

  @Column({ name: 'patient_treatment_id', type: 'int' })
  patientTreatmentId: number;

  @Column({ name: 'appointment_date', type: 'timestamp', nullable: true })
  appointmentDate: Date;

  @Column({ 
    name: 'status', 
    type: 'varchar', 
    length: 20, 
    default: AppointmentStatus.SCHEDULED 
  })
  status: AppointmentStatus;

  @Column({ name: 'progress_percentage', type: 'int', nullable: true })
  progressPercentage: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => PatientTreatment, (patientTreatment) => patientTreatment.appointments)
  @JoinColumn({ name: 'patient_treatment_id' })
  patientTreatment: PatientTreatment;

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.appointment)
  diagnoses: Diagnosis[];

  @OneToMany(() => AppointmentAnswer, (appointmentAnswer) => appointmentAnswer.appointment)
  appointmentAnswers: AppointmentAnswer[];

  @OneToMany(() => AiEvaluation, (aiEvaluation) => aiEvaluation.appointment)
  aiEvaluations: AiEvaluation[];
}

