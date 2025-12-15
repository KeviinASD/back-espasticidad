import { IsInt, IsNotEmpty, IsBoolean, IsOptional, IsString, Min } from 'class-validator';

export class CreateDiagnosisDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  appointmentId: number;

  @IsBoolean()
  @IsNotEmpty()
  hasSpasticity: boolean;

  @IsOptional()
  @IsString()
  diagnosisSummary?: string;
}

