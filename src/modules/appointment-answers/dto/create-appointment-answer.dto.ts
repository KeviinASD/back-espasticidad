import { IsInt, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateAppointmentAnswerDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  appointmentId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  questionId: number;

  @IsOptional()
  @IsNumber()
  numericValue?: number;
}

