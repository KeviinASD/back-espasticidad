import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AppointmentAnswer } from '../../appointment-answers/entity/appointment-answer.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn({ name: 'question_id' })
  questionId: number;

  @Column({ name: 'question_text', type: 'text', nullable: false })
  questionText: string;

  @OneToMany(() => AppointmentAnswer, (appointmentAnswer) => appointmentAnswer.question)
  appointmentAnswers: AppointmentAnswer[];
}

