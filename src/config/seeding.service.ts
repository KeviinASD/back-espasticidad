import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Treatment } from '../modules/treatments/entity/treatment.entity';
import { seedTreatments } from './seeding/data';

@Injectable()
export class SeedingService implements OnModuleInit {
  constructor(
    @InjectRepository(Treatment)
    private treatmentRepository: Repository<Treatment>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    console.log('🚀 Iniciando seeding de datos...');
    
    try {
      // Seed de tratamientos
      await seedTreatments(this.treatmentRepository);
      
      console.log('✅ Seeding completado exitosamente');
    } catch (error) {
      console.error('❌ Error en el seeding:', error);
    }
  }
}
