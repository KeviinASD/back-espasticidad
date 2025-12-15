import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTreatmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  treatmentName: string;

  @IsOptional()
  @IsString()
  description?: string;
}

