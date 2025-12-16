import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientTreatment } from './entity/patient-treatment.entity';
import { CreatePatientTreatmentDto } from './dto/create-patient-treatment.dto';
import { UpdatePatientTreatmentDto } from './dto/update-patient-treatment.dto';

@Injectable()
export class PatientTreatmentsService {
  constructor(
    @InjectRepository(PatientTreatment)
    private patientTreatmentRepository: Repository<PatientTreatment>,
  ) {}

  async create(createPatientTreatmentDto: CreatePatientTreatmentDto): Promise<PatientTreatment> {
    const patientTreatment = this.patientTreatmentRepository.create(createPatientTreatmentDto);
    return await this.patientTreatmentRepository.save(patientTreatment);
  }

  async findAll(filters?: { patientId?: number; doctorId?: number }): Promise<PatientTreatment[]> {
    const where: any = {};
    
    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters?.doctorId) {
      where.doctorId = filters.doctorId;
    }
    
    return await this.patientTreatmentRepository.find({
      where: Object.keys(where).length > 0 ? where : undefined,
      relations: ['patient', 'doctor', 'treatment'],
      order: { startDate: 'DESC' }
    });
  }

  async findOne(id: number): Promise<PatientTreatment> {
    const patientTreatment = await this.patientTreatmentRepository.findOne({
      where: { patientTreatmentId: id },
      relations: ['patient', 'doctor', 'treatment']
    });
    
    if (!patientTreatment) {
      throw new NotFoundException(`Patient treatment with ID ${id} not found`);
    }
    
    return patientTreatment;
  }

  async findByPatient(patientId: number): Promise<PatientTreatment[]> {
    return await this.patientTreatmentRepository.find({
      where: { patientId },
      relations: ['patient', 'doctor', 'treatment'],
      order: { startDate: 'DESC' }
    });
  }

  async findByDoctor(doctorId: number): Promise<PatientTreatment[]> {
    return await this.patientTreatmentRepository.find({
      where: { doctorId },
      relations: ['patient', 'doctor', 'treatment'],
      order: { startDate: 'DESC' }
    });
  }

  async update(id: number, updatePatientTreatmentDto: UpdatePatientTreatmentDto): Promise<PatientTreatment> {
    const patientTreatment = await this.findOne(id);
    
    Object.assign(patientTreatment, updatePatientTreatmentDto);
    
    return await this.patientTreatmentRepository.save(patientTreatment);
  }

  async remove(id: number): Promise<void> {
    const patientTreatment = await this.findOne(id);
    await this.patientTreatmentRepository.remove(patientTreatment);
  }
}

