import { PartialType } from '@nestjs/mapped-types';
import { CreateAiEvaluationDto } from './create-ai-evaluation.dto';

export class UpdateAiEvaluationDto extends PartialType(CreateAiEvaluationDto) {}

