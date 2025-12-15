import { IsInt, IsNotEmpty, IsOptional, IsEnum, IsString, Min, Max, MinLength } from 'class-validator';
import { AppointmentStatus } from '../entity/appointment.entity';

export class CreateAppointmentDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  patientTreatmentId: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @Min(0)
  @Max(100)
  progressPercentage?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

