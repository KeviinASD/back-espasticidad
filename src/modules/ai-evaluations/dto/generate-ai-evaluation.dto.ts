import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateAiEvaluationDto {
  @ApiProperty({ description: 'ID de la cita' })
  @IsNumber()
  @IsNotEmpty()
  appointmentId: number;

  @ApiProperty({ description: 'ID de la herramienta de IA (Copilot = 2)' })
  @IsNumber()
  @IsNotEmpty()
  aiToolId: number;

  @ApiProperty({ description: 'Hallazgos clínicos', example: 'Hipertonía marcada en flexores codo der.' })
  @IsString()
  @IsNotEmpty()
  findings: string;

  @ApiProperty({ description: 'Escala MAS', example: 'Previa 2, reporte de empeoramiento.', required: false })
  @IsString()
  @IsOptional()
  masScale?: string;

  @ApiProperty({ description: 'Medicaciones actuales', example: 'Baclofeno 10mg c/8h (respuesta subóptima).', required: false })
  @IsString()
  @IsOptional()
  medications?: string;

  @ApiProperty({ description: 'Edad del paciente', required: false })
  @IsNumber()
  @IsOptional()
  patientAge?: number;

  @ApiProperty({ description: 'Condición del paciente', example: 'Espasticidad post-ictus', required: false })
  @IsString()
  @IsOptional()
  patientCondition?: string;
}

