import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentAnswerDto } from './create-appointment-answer.dto';

export class UpdateAppointmentAnswerDto extends PartialType(CreateAppointmentAnswerDto) {}

