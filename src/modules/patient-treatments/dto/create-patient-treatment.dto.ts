import { IsInt, IsNotEmpty, IsOptional, IsDateString, Min, Matches } from 'class-validator';
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
    description: 'ID del médico (usuario) - Se asigna automáticamente del usuario autenticado. Este campo se ignora si se envía.',
    example: 1,
    minimum: 1,
    required: false
  })
  @IsOptional()
  doctorId?: number;

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
    description: 'Fecha de inicio del tratamiento en formato YYYY-MM-DD',
    example: '2024-01-15',
    required: false,
    type: String
  })
  @IsOptional()
  @IsDateString({}, { message: 'startDate debe ser una fecha válida en formato ISO (YYYY-MM-DD)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate debe estar en formato YYYY-MM-DD' })
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de finalización del tratamiento en formato YYYY-MM-DD',
    example: '2024-06-15',
    required: false,
    type: String
  })
  @IsOptional()
  @IsDateString({}, { message: 'endDate debe ser una fecha válida en formato ISO (YYYY-MM-DD)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate debe estar en formato YYYY-MM-DD' })
  endDate?: string;
}

