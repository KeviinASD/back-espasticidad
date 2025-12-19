import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    console.log('🚀 Iniciando seeding de datos...');
    
    try {
      // Seed de tratamientos
      await seedTreatments(this.treatmentRepository);
      
      // Seed de preguntas cuantitativas
      await seedQuestions(this.questionRepository, this.dataSource);
      
      // Seed de herramientas de IA
      await seedAiTools(this.aiToolRepository);
      
      console.log('✅ Seeding completado exitosamente');
      return { message: 'Seeding completado exitosamente' };
    } catch (error) {
      console.error('❌ Error en el seeding:', error);
      throw error;
    }
  }

  async seedQuestions() {
    console.log('🚀 Iniciando seeding de preguntas...');
    
    try {
      await seedQuestions(this.questionRepository, this.dataSource);
      console.log('✅ Seeding de preguntas completado exitosamente');
      return { message: 'Preguntas actualizadas exitosamente' };
    } catch (error) {
      console.error('❌ Error en el seeding de preguntas:', error);
      throw error;
    }
  }
}
