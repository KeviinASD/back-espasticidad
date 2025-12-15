import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSystemLogDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  doctorId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  action?: string;
}

