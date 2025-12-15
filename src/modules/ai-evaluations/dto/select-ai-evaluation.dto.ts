import { IsString, IsOptional } from 'class-validator';

export class SelectAiEvaluationDto {
  @IsOptional()
  @IsString()
  justification?: string;
}

