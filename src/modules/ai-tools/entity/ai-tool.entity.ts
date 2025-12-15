import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AiEvaluation } from '../../ai-evaluations/entity/ai-evaluation.entity';

@Entity('ai_tools')
export class AiTool {
  @PrimaryGeneratedColumn({ name: 'ai_tool_id' })
  aiToolId: number;

  @Column({ name: 'name', type: 'varchar', length: 50, unique: true, nullable: false })
  name: string;

  @OneToMany(() => AiEvaluation, (aiEvaluation) => aiEvaluation.aiTool)
  aiEvaluations: AiEvaluation[];
}

