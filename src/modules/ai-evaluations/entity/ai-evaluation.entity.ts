import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Appointment } from '../../appointments/entity/appointment.entity';
import { AiTool } from '../../ai-tools/entity/ai-tool.entity';

@Entity('ai_evaluations')
@Unique(['appointmentId', 'aiToolId'])
export class AiEvaluation {
  @PrimaryGeneratedColumn({ name: 'evaluation_id' })
  evaluationId: number;

  @Column({ name: 'appointment_id', type: 'int' })
  appointmentId: number;

  @Column({ name: 'ai_tool_id', type: 'int' })
  aiToolId: number;

  @Column({ name: 'ai_result', type: 'text', nullable: false })
  aiResult: string;

  @Column({ name: 'is_selected', type: 'boolean', default: false })
  isSelected: boolean;

  @Column({ name: 'justification', type: 'text', nullable: true })
  justification: string;

  @CreateDateColumn({ name: 'evaluation_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  evaluationDate: Date;

  @ManyToOne(() => Appointment, (appointment) => appointment.aiEvaluations)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ManyToOne(() => AiTool, (aiTool) => aiTool.aiEvaluations)
  @JoinColumn({ name: 'ai_tool_id' })
  aiTool: AiTool;
}

