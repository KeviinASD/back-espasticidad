import { IsInt, IsNotEmpty, IsString, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateAiEvaluationDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  appointmentId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  aiToolId: number;

  @IsString()
  @IsNotEmpty()
  aiResult: string;

  @IsOptional()
  @IsBoolean()
  isSelected?: boolean;

  @IsOptional()
  @IsString()
  justification?: string;
}

