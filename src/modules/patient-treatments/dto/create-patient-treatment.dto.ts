import { IsInt, IsNotEmpty, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientTreatmentDto {
  @ApiProperty({
    description: 'ID del paciente',
    example: 1,
    minimum: 1
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  patientId: number;

  @ApiProperty({
    description: 'ID del médico (usuario)',
    example: 1,
    minimum: 1
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  doctorId: number;

  @ApiProperty({
    description: 'ID del tratamiento',
    example: 1,
    minimum: 1
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  treatmentId: number;

  @ApiProperty({
    description: 'Fecha de inicio del tratamiento',
    example: '2024-01-15',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({
    description: 'Fecha de finalización del tratamiento',
    example: '2024-06-15',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}

