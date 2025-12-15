import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientTreatmentDto } from './create-patient-treatment.dto';

export class UpdatePatientTreatmentDto extends PartialType(CreatePatientTreatmentDto) {}

