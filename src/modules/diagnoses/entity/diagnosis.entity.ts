import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Appointment } from '../../appointments/entity/appointment.entity';

@Entity('diagnoses')
export class Diagnosis {
  @PrimaryGeneratedColumn({ name: 'diagnosis_id' })
  diagnosisId: number;

  @Column({ name: 'appointment_id', type: 'int' })
  appointmentId: number;

  @Column({ name: 'has_spasticity', type: 'boolean', nullable: false })
  hasSpasticity: boolean;

  @Column({ name: 'diagnosis_summary', type: 'text', nullable: true })
  diagnosisSummary: string;

  @CreateDateColumn({ name: 'diagnosis_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  diagnosisDate: Date;

  @ManyToOne(() => Appointment, (appointment) => appointment.diagnoses)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}

