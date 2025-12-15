import { IsInt, IsNotEmpty, IsOptional, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerItemDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  questionId: number;

  @IsOptional()
  @IsNumber()
  numericValue?: number;
}

export class CreateMultipleAnswersDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  appointmentId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}

