import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PatientTreatment } from '../../patient-treatments/entity/patient-treatment.entity';

@Entity('treatments')
export class Treatment {
  @PrimaryGeneratedColumn({ name: 'treatment_id' })
  treatmentId: number;

  @Column({ name: 'treatment_name', type: 'varchar', length: 100, nullable: false })
  treatmentName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @OneToMany(() => PatientTreatment, (patientTreatment) => patientTreatment.treatment)
  patientTreatments: PatientTreatment[];
}

