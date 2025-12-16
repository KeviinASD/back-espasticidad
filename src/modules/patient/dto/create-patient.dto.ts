import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ example: 'Juan Pérez' })
  fullName: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '1990-05-15', required: false })
  birthDate?: Date;
}
