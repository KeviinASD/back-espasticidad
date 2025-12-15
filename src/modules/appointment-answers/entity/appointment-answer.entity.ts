import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Appointment } from '../../appointments/entity/appointment.entity';
import { Question } from '../../questions/entity/question.entity';

@Entity('appointment_answers')
export class AppointmentAnswer {
  @PrimaryGeneratedColumn({ name: 'answer_id' })
  answerId: number;

  @Column({ name: 'appointment_id', type: 'int' })
  appointmentId: number;

  @Column({ name: 'question_id', type: 'int' })
  questionId: number;

  @Column({ name: 'numeric_value', type: 'numeric', precision: 5, scale: 2, nullable: true })
  numericValue: number;

  @ManyToOne(() => Appointment, (appointment) => appointment.appointmentAnswers)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ManyToOne(() => Question, (question) => question.appointmentAnswers)
  @JoinColumn({ name: 'question_id' })
  question: Question;
}

