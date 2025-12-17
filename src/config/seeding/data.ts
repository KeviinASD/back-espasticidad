import { CreateTreatmentDto } from 'src/modules/treatments/dto/create-treatment.dto';
import { Treatment } from 'src/modules/treatments/entity/treatment.entity';
import { CreateQuestionDto } from 'src/modules/questions/dto/create-question.dto';
import { Question } from 'src/modules/questions/entity/question.entity';
import { CreateAiToolDto } from 'src/modules/ai-tools/dto/create-ai-tool.dto';
import { AiTool } from 'src/modules/ai-tools/entity/ai-tool.entity';
import { Repository } from 'typeorm';

// ============== TRATAMIENTOS ==============
export const treatmentsSeeder: CreateTreatmentDto[] = [
  {
    treatmentName: 'Fisioterapia para Espasticidad',
    description: 'Tratamiento de fisioterapia especializado para el manejo de la espasticidad, incluyendo técnicas de estiramiento, fortalecimiento muscular, movilización articular y entrenamiento funcional para mejorar la calidad de vida del paciente.'
  }
];

export const seedTreatments = async (treatmentRepository: Repository<Treatment>): Promise<void> => {
  const count = await treatmentRepository.count();
  
  if (count === 0) {
    console.log('🌱 Seeding tratamientos...');
    
    for (const treatmentData of treatmentsSeeder) {
      const treatment = treatmentRepository.create(treatmentData);
      await treatmentRepository.save(treatment);
      console.log(`✅ Tratamiento creado: ${treatmentData.treatmentName}`);
    }
  } else {
    console.log('✓ Tratamientos ya existen en la base de datos');
  }
};

// ============== PREGUNTAS CUANTITATIVAS ==============
export const questionsSeeder: CreateQuestionDto[] = [
  {
    questionText: 'Número de espasmos por día'
  },
  {
    questionText: 'Ritmo cardíaco (bpm)'
  },
  {
    questionText: 'Peso (kg)'
  }
];

export const seedQuestions = async (questionRepository: Repository<Question>): Promise<void> => {
  const count = await questionRepository.count();
  
  if (count === 0) {
    console.log('🌱 Seeding preguntas cuantitativas...');
    
    for (const questionData of questionsSeeder) {
      const question = questionRepository.create(questionData);
      await questionRepository.save(question);
      console.log(`✅ Pregunta creada: ${questionData.questionText}`);
    }
  } else {
    console.log('✓ Preguntas ya existen en la base de datos');
  }
};

// ============== HERRAMIENTAS DE IA ==============
export const aiToolsSeeder: CreateAiToolDto[] = [
  {
    name: 'ChatGPT-4'
  },
  {
    name: 'Copilot Medical'
  }
];

export const seedAiTools = async (aiToolRepository: Repository<AiTool>): Promise<void> => {
  const count = await aiToolRepository.count();
  
  if (count === 0) {
    console.log('🌱 Seeding herramientas de IA...');
    
    for (const aiToolData of aiToolsSeeder) {
      const aiTool = aiToolRepository.create(aiToolData);
      await aiToolRepository.save(aiTool);
      console.log(`✅ Herramienta IA creada: ${aiToolData.name}`);
    }
  } else {
    console.log('✓ Herramientas de IA ya existen en la base de datos');
  }
};