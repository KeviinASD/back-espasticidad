import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Treatment } from './entity/treatment.entity';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectRepository(Treatment)
    private treatmentRepository: Repository<Treatment>,
  ) {}

  async create(createTreatmentDto: CreateTreatmentDto): Promise<Treatment> {
    const treatment = this.treatmentRepository.create(createTreatmentDto);
    return await this.treatmentRepository.save(treatment);
  }

  async findAll(): Promise<Treatment[]> {
    return await this.treatmentRepository.find({
      order: { treatmentName: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOne({
      where: { treatmentId: id }
    });
    
    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }
    
    return treatment;
  }

  async update(id: number, updateTreatmentDto: UpdateTreatmentDto): Promise<Treatment> {
    const treatment = await this.findOne(id);
    
    Object.assign(treatment, updateTreatmentDto);
    
    return await this.treatmentRepository.save(treatment);
  }

  async remove(id: number): Promise<void> {
    const treatment = await this.findOne(id);
    await this.treatmentRepository.remove(treatment);
  }
}

