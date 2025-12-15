import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from '../../patient/entity/patient.entity';
import { User } from '../../security/entities/user.entity';
import { Treatment } from '../../treatments/entity/treatment.entity';
import { Appointment } from '../../appointments/entity/appointment.entity';

@Entity('patient_treatments')
export class PatientTreatment {
  @PrimaryGeneratedColumn({ name: 'patient_treatment_id' })
  patientTreatmentId: number;

  @Column({ name: 'patient_id', type: 'int' })
  patientId: number;

  @Column({ name: 'doctor_id', type: 'int' })
  doctorId: number;

  @Column({ name: 'treatment_id', type: 'int' })
  treatmentId: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @ManyToOne(() => Patient, (patient) => patient.patientTreatments)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => User, (user) => user.patientTreatments)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @ManyToOne(() => Treatment, (treatment) => treatment.patientTreatments)
  @JoinColumn({ name: 'treatment_id' })
  treatment: Treatment;

  @OneToMany(() => Appointment, (appointment) => appointment.patientTreatment)
  appointments: Appointment[];
}

