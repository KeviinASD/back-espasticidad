import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnosis } from './entity/diagnosis.entity';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';

@Injectable()
export class DiagnosesService {
  constructor(
    @InjectRepository(Diagnosis)
    private diagnosisRepository: Repository<Diagnosis>,
  ) {}

  async create(createDiagnosisDto: CreateDiagnosisDto): Promise<Diagnosis> {
    const diagnosis = this.diagnosisRepository.create(createDiagnosisDto);
    return await this.diagnosisRepository.save(diagnosis);
  }

  async findAll(): Promise<Diagnosis[]> {
    return await this.diagnosisRepository.find({
      relations: ['appointment'],
      order: { diagnosisDate: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Diagnosis> {
    const diagnosis = await this.diagnosisRepository.findOne({
      where: { diagnosisId: id },
      relations: ['appointment']
    });
    
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with ID ${id} not found`);
    }
    
    return diagnosis;
  }

  async findByAppointment(appointmentId: number): Promise<Diagnosis | null> {
    return await this.diagnosisRepository.findOne({
      where: { appointmentId },
      relations: ['appointment']
    });
  }

  async update(id: number, updateDiagnosisDto: UpdateDiagnosisDto): Promise<Diagnosis> {
    const diagnosis = await this.findOne(id);
    
    Object.assign(diagnosis, updateDiagnosisDto);
    
    return await this.diagnosisRepository.save(diagnosis);
  }

  async remove(id: number): Promise<void> {
    const diagnosis = await this.findOne(id);
    await this.diagnosisRepository.remove(diagnosis);
  }
}

