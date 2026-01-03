import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, MaxLength, Matches } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ example: 'Juan Pérez' })
  fullName: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { 
    message: 'birthDate debe tener el formato YYYY-MM-DD (ejemplo: 1990-05-15)' 
  })
  @ApiProperty({ example: '1990-05-15', required: false, type: String })
  birthDate?: string; // Mantener como string ISO (YYYY-MM-DD), se convertirá a Date en el servicio
}
