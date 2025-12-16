import { PartialType } from '@nestjs/swagger';
import { CreatePatientTreatmentDto } from './create-patient-treatment.dto';

export class UpdatePatientTreatmentDto extends PartialType(CreatePatientTreatmentDto) {}

