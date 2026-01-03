import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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
    // Convertir fechas de string a Date si están presentes
    const treatmentData: any = {
      patientId: createPatientTreatmentDto.patientId,
      doctorId: createPatientTreatmentDto.doctorId,
      treatmentId: createPatientTreatmentDto.treatmentId,
    };

    if (createPatientTreatmentDto.startDate) {
      const startDate = new Date(createPatientTreatmentDto.startDate);
      // Validar que la fecha sea válida
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException(`La fecha de inicio '${createPatientTreatmentDto.startDate}' no es válida. Debe estar en formato YYYY-MM-DD`);
      }
      treatmentData.startDate = startDate;
    }

    if (createPatientTreatmentDto.endDate) {
      const endDate = new Date(createPatientTreatmentDto.endDate);
      // Validar que la fecha sea válida
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException(`La fecha de fin '${createPatientTreatmentDto.endDate}' no es válida. Debe estar en formato YYYY-MM-DD`);
      }
      treatmentData.endDate = endDate;
    }

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    if (treatmentData.startDate && treatmentData.endDate) {
      if (treatmentData.endDate < treatmentData.startDate) {
        throw new BadRequestException('La fecha de fin debe ser posterior o igual a la fecha de inicio');
      }
    }

    try {
      const patientTreatment = this.patientTreatmentRepository.create(treatmentData);
      const saved = await this.patientTreatmentRepository.save(patientTreatment);
      // TypeORM save puede devolver un array si se pasa un array, pero aquí siempre es un objeto único
      return Array.isArray(saved) ? saved[0] : saved;
    } catch (error: any) {
      // Mejorar mensajes de error de base de datos
      if (error.code === '23503') { // Foreign key violation
        if (error.detail?.includes('patient_id')) {
          throw new BadRequestException(`El paciente con ID ${treatmentData.patientId} no existe`);
        }
        if (error.detail?.includes('doctor_id')) {
          throw new BadRequestException(`El doctor con ID ${treatmentData.doctorId} no existe`);
        }
        if (error.detail?.includes('treatment_id')) {
          throw new BadRequestException(`El tratamiento con ID ${treatmentData.treatmentId} no existe`);
        }
      }
      throw new BadRequestException(`Error al crear el tratamiento: ${error.message || 'Error desconocido'}`);
    }
  }

  async findAll(filters?: { patientId?: number; doctorId?: number }): Promise<PatientTreatment[]> {
    const where: any = {};
    
    // doctorId es obligatorio para filtrar por el doctor autenticado
    if (filters?.doctorId) {
      where.doctorId = filters.doctorId;
    }
    
    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }
    
    return await this.patientTreatmentRepository.find({
      where,
      relations: ['patient', 'doctor', 'treatment'],
      order: { startDate: 'DESC' }
    });
  }

  async findOne(id: number, doctorId: number): Promise<PatientTreatment> {
    const patientTreatment = await this.patientTreatmentRepository.findOne({
      where: { 
        patientTreatmentId: id,
        doctorId: doctorId // Verificar que pertenece al doctor
      },
      relations: ['patient', 'doctor', 'treatment']
    });
    
    if (!patientTreatment) {
      throw new NotFoundException(`Patient treatment with ID ${id} not found or you don't have access to it`);
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

  async update(id: number, updatePatientTreatmentDto: UpdatePatientTreatmentDto, doctorId: number): Promise<PatientTreatment> {
    // Verificar que el tratamiento pertenece al doctor antes de actualizar
    const patientTreatment = await this.findOne(id, doctorId);
    
    // No permitir cambiar el doctorId (solo el doctor dueño puede actualizar)
    const { doctorId: _, ...updateData } = updatePatientTreatmentDto as any;
    
    // Convertir fechas de string a Date si están presentes
    if (updateData.startDate && typeof updateData.startDate === 'string') {
      const startDate = new Date(updateData.startDate);
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException(`La fecha de inicio '${updateData.startDate}' no es válida. Debe estar en formato YYYY-MM-DD`);
      }
      updateData.startDate = startDate;
    }

    if (updateData.endDate && typeof updateData.endDate === 'string') {
      const endDate = new Date(updateData.endDate);
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException(`La fecha de fin '${updateData.endDate}' no es válida. Debe estar en formato YYYY-MM-DD`);
      }
      updateData.endDate = endDate;
    }

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    const finalStartDate = updateData.startDate || patientTreatment.startDate;
    const finalEndDate = updateData.endDate || patientTreatment.endDate;
    if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
      throw new BadRequestException('La fecha de fin debe ser posterior o igual a la fecha de inicio');
    }

    Object.assign(patientTreatment, updateData);
    
    try {
      const saved = await this.patientTreatmentRepository.save(patientTreatment);
      return Array.isArray(saved) ? saved[0] : saved;
    } catch (error: any) {
      if (error.code === '23503') { // Foreign key violation
        if (error.detail?.includes('patient_id')) {
          throw new BadRequestException(`El paciente con ID ${updateData.patientId} no existe`);
        }
        if (error.detail?.includes('treatment_id')) {
          throw new BadRequestException(`El tratamiento con ID ${updateData.treatmentId} no existe`);
        }
      }
      throw new BadRequestException(`Error al actualizar el tratamiento: ${error.message || 'Error desconocido'}`);
    }
  }

  async remove(id: number, doctorId: number): Promise<void> {
    // Verificar que el tratamiento pertenece al doctor antes de eliminar
    const patientTreatment = await this.findOne(id, doctorId);
    await this.patientTreatmentRepository.remove(patientTreatment);
  }
}

