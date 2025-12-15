import { IsInt, IsNotEmpty, IsOptional, IsDateString, Min } from 'class-validator';

export class CreatePatientTreatmentDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  patientId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  doctorId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  treatmentId: number;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;
}

