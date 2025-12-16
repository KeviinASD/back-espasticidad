import { CreateTreatmentDto } from 'src/modules/treatments/dto/create-treatment.dto';
import { Treatment } from 'src/modules/treatments/entity/treatment.entity';
import { Repository } from 'typeorm';

export const treatmentsSeeder: CreateTreatmentDto[] = [
  {
    treatmentName: 'Fisioterapia para Espasticidad',
    description: 'Tratamiento de fisioterapia especializado para el manejo de la espasticidad, incluyendo técnicas de estiramiento, fortalecimiento muscular, movilización articular y entrenamiento funcional para mejorar la calidad de vida del paciente.'
  }
];

export const seedTreatments = async (treatmentRepository: Repository<Treatment>): Promise<void> => {
  const count = await treatmentRepository.count();
  
  // Solo crear el tratamiento si no existe ninguno en la base de datos
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