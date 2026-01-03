import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entity/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientTreatment } from '../patient-treatments/entity/patient-treatment.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(PatientTreatment)
    private patientTreatmentRepository: Repository<PatientTreatment>,
  ) {}

  async create(createPatientDto: CreatePatientDto, doctorId: number): Promise<Patient> {
    // Crear el paciente
    // Si birthDate viene como string, convertirlo a Date
    const patientData: Partial<Patient> = {
      fullName: createPatientDto.fullName,
    };
    
    if (createPatientDto.birthDate && typeof createPatientDto.birthDate === 'string') {
      patientData.birthDate = new Date(createPatientDto.birthDate);
    }
    
    const patient = this.patientRepository.create(patientData);
    const savedPatient = await this.patientRepository.save(patient);
    
    // Nota: El paciente se asociará con el doctor cuando se cree un patient_treatment
    // Por ahora solo creamos el paciente, la asociación se hace al crear el tratamiento
    
    return savedPatient as Patient;
  }

  async findAll(doctorId: number): Promise<Patient[]> {
    // Filtrar pacientes que:
    // 1. Tengan al menos un tratamiento con este doctor, O
    // 2. No tengan ningún tratamiento (para que aparezcan pacientes recién creados)
    // 
    // NOTA IMPORTANTE: La opción 2 muestra TODOS los pacientes sin tratamiento a TODOS los doctores.
    // Esto es una limitación porque no tenemos un campo created_by en la tabla patients.
    // La solución ideal sería agregar un campo created_by/doctor_id a la tabla patients.
    // 
    // Solución actual: Usar un subquery para incluir pacientes sin tratamiento
    const patientsWithTreatment = await this.patientRepository
      .createQueryBuilder('patient')
      .innerJoin('patient.patientTreatments', 'pt')
      .where('pt.doctorId = :doctorId', { doctorId })
      .distinct(true)
      .getMany();

    const patientsWithoutTreatment = await this.patientRepository
      .createQueryBuilder('patient')
      .leftJoin('patient.patientTreatments', 'pt')
      .where('pt.patientTreatmentId IS NULL')
      .getMany();

    // Combinar y ordenar
    const allPatients = [...patientsWithTreatment, ...patientsWithoutTreatment];
    return allPatients
      .filter((patient, index, self) => 
        index === self.findIndex(p => p.patientId === patient.patientId)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findOne(id: number, doctorId: number): Promise<Patient> {
    // Buscar el paciente
    const patient = await this.patientRepository.findOne({
      where: { patientId: id },
      relations: ['patientTreatments']
    });
    
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    
    // Verificar que el paciente pertenece a este doctor (tiene un tratamiento con este doctor)
    // O que no tiene ningún tratamiento (paciente nuevo)
    const hasTreatmentWithDoctor = patient.patientTreatments?.some(
      pt => pt.doctorId === doctorId
    );
    const hasNoTreatments = !patient.patientTreatments || patient.patientTreatments.length === 0;
    
    if (!hasTreatmentWithDoctor && !hasNoTreatments) {
      throw new NotFoundException(`Patient with ID ${id} not found or you don't have access to it`);
    }
    
    return patient;
  }

  async update(id: number, updatePatientDto: UpdatePatientDto, doctorId: number): Promise<Patient> {
    // Verificar que el paciente pertenece a este doctor antes de actualizar
    const patient = await this.findOne(id, doctorId);
    
    Object.assign(patient, updatePatientDto);
    
    return await this.patientRepository.save(patient);
  }

  async remove(id: number, doctorId: number): Promise<void> {
    // Verificar que el paciente pertenece a este doctor antes de eliminar
    const patient = await this.findOne(id, doctorId);
    await this.patientRepository.remove(patient);
  }
}
