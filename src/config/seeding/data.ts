import { CreateTreatmentDto } from 'src/modules/treatments/dto/create-treatment.dto';
import { Treatment } from 'src/modules/treatments/entity/treatment.entity';
import { CreateQuestionDto } from 'src/modules/questions/dto/create-question.dto';
import { Question } from 'src/modules/questions/entity/question.entity';
import { CreateAiToolDto } from 'src/modules/ai-tools/dto/create-ai-tool.dto';
import { AiTool } from 'src/modules/ai-tools/entity/ai-tool.entity';
import { AppointmentAnswer } from 'src/modules/appointment-answers/entity/appointment-answer.entity';
import { Repository, DataSource } from 'typeorm';

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

// ============== PREGUNTAS CUANTITATIVAS (INDICADORES) ==============
export const questionsSeeder: CreateQuestionDto[] = [
  {
    questionText: 'Modified Ashworth Scale (MAS)'
  },
  {
    questionText: 'Frecuencia de espasmos musculares (por día)'
  },
  {
    questionText: 'H-Reflex Ratio (Hmax / Mmax)'
  },
  {
    questionText: 'Stretch Reflex Threshold (SRT) (°/s)'
  },
  {
    questionText: 'Ritmo cardíaco (bpm)'
  },
  {
    questionText: 'Peso (kg)'
  }
];

export const seedQuestions = async (
  questionRepository: Repository<Question>,
  dataSource?: DataSource,
): Promise<void> => {
  // NO borrar preguntas existentes, solo agregar las que faltan
  console.log(`🌱 Verificando preguntas cuantitativas (${questionsSeeder.length} indicadores)...`);
  
  let createdCount = 0;
  let existingCount = 0;
  
  for (const questionData of questionsSeeder) {
    // Verificar si la pregunta ya existe por su texto
    const existingQuestion = await questionRepository.findOne({
      where: { questionText: questionData.questionText }
    });
    
    if (existingQuestion) {
      console.log(`✓ Pregunta ya existe: ${questionData.questionText}`);
      existingCount++;
    } else {
      // Solo crear si no existe
      const question = questionRepository.create(questionData);
      await questionRepository.save(question);
      console.log(`✅ Pregunta creada: ${questionData.questionText}`);
      createdCount++;
    }
  }
  
  console.log(`✅ Seed completado: ${createdCount} nueva(s), ${existingCount} existente(s)`);
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