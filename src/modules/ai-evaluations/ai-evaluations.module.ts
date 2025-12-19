import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiEvaluationsService } from './ai-evaluations.service';
import { AiEvaluationsController } from './ai-evaluations.controller';
import { AiEvaluation } from './entity/ai-evaluation.entity';
import { CopilotService } from './services/copilot.service';
import { AiProviderService } from './services/ai-provider.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiEvaluation])],
  controllers: [AiEvaluationsController],
  providers: [AiEvaluationsService, CopilotService, AiProviderService],
  exports: [AiEvaluationsService, CopilotService, AiProviderService],
})
export class AiEvaluationsModule {}

