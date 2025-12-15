import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiEvaluationsService } from './ai-evaluations.service';
import { AiEvaluationsController } from './ai-evaluations.controller';
import { AiEvaluation } from './entity/ai-evaluation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiEvaluation])],
  controllers: [AiEvaluationsController],
  providers: [AiEvaluationsService],
  exports: [AiEvaluationsService],
})
export class AiEvaluationsModule {}

