import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Treatment } from '../modules/treatments/entity/treatment.entity';
import { Question } from '../modules/questions/entity/question.entity';
import { AiTool } from '../modules/ai-tools/entity/ai-tool.entity';
import { seedTreatments, seedQuestions, seedAiTools } from './seeding/data';

@Injectable()
export class SeedingService implements OnModuleInit {
  constructor(
    @InjectRepository(Treatment)
    private treatmentRepository: Repository<Treatment>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(AiTool)
    private aiToolRepository: Repository<AiTool>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    console.log('🚀 Iniciando seeding de datos...');
    
    try {
      // Seed de tratamientos
      await seedTreatments(this.treatmentRepository);
      
      // Seed de preguntas cuantitativas
      await seedQuestions(this.questionRepository);
      
      // Seed de herramientas de IA
      await seedAiTools(this.aiToolRepository);
      
      console.log('✅ Seeding completado exitosamente');
    } catch (error) {
      console.error('❌ Error en el seeding:', error);
    }
  }
}
