import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entity/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(createAppointmentDto);
    return await this.appointmentRepository.save(appointment);
  }

  async findAll(doctorId?: number): Promise<Appointment[]> {
    if (!doctorId) {
      // Si no hay doctorId, retornar todos (para compatibilidad, pero idealmente siempre debe haber doctorId)
      return await this.appointmentRepository.find({
        relations: ['patientTreatment', 'patientTreatment.patient', 'patientTreatment.doctor', 'patientTreatment.treatment'],
        order: { appointmentDate: 'DESC' }
      });
    }

    // Filtrar por doctor a través de patientTreatment
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patientTreatment', 'patientTreatment')
      .leftJoinAndSelect('patientTreatment.patient', 'patient')
      .leftJoinAndSelect('patientTreatment.doctor', 'doctor')
      .leftJoinAndSelect('patientTreatment.treatment', 'treatment')
      .where('patientTreatment.doctorId = :doctorId', { doctorId })
      .orderBy('appointment.appointmentDate', 'DESC')
      .getMany();
  }

  async findOne(id: number, doctorId: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patientTreatment', 'patientTreatment')
      .leftJoinAndSelect('patientTreatment.patient', 'patient')
      .leftJoinAndSelect('patientTreatment.doctor', 'doctor')
      .leftJoinAndSelect('patientTreatment.treatment', 'treatment')
      .leftJoinAndSelect('appointment.appointmentAnswers', 'appointmentAnswers')
      .leftJoinAndSelect('appointmentAnswers.question', 'question')
      .leftJoinAndSelect('appointment.diagnoses', 'diagnoses')
      .leftJoinAndSelect('appointment.aiEvaluations', 'aiEvaluations')
      .leftJoinAndSelect('aiEvaluations.aiTool', 'aiTool')
      .where('appointment.appointmentId = :id', { id })
      .andWhere('patientTreatment.doctorId = :doctorId', { doctorId })
      .getOne();
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found or you don't have access to it`);
    }
    
    return appointment;
  }

  async findByPatientTreatment(patientTreatmentId: number, doctorId?: number): Promise<Appointment[]> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patientTreatment', 'patientTreatment')
      .leftJoinAndSelect('patientTreatment.patient', 'patient')
      .leftJoinAndSelect('patientTreatment.doctor', 'doctor')
      .leftJoinAndSelect('patientTreatment.treatment', 'treatment')
      .where('appointment.patientTreatmentId = :patientTreatmentId', { patientTreatmentId });

    if (doctorId) {
      queryBuilder.andWhere('patientTreatment.doctorId = :doctorId', { doctorId });
    }

    return await queryBuilder
      .orderBy('appointment.appointmentDate', 'DESC')
      .getMany();
  }

  async findByStatus(status: AppointmentStatus, doctorId?: number): Promise<Appointment[]> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patientTreatment', 'patientTreatment')
      .leftJoinAndSelect('patientTreatment.patient', 'patient')
      .leftJoinAndSelect('patientTreatment.doctor', 'doctor')
      .leftJoinAndSelect('patientTreatment.treatment', 'treatment')
      .where('appointment.status = :status', { status });

    if (doctorId) {
      queryBuilder.andWhere('patientTreatment.doctorId = :doctorId', { doctorId });
    }

    return await queryBuilder
      .orderBy('appointment.appointmentDate', 'DESC')
      .getMany();
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto, doctorId: number): Promise<Appointment> {
    // Verificar que el appointment pertenece al doctor antes de actualizar
    const appointment = await this.findOne(id, doctorId);
    
    Object.assign(appointment, updateAppointmentDto);
    
    return await this.appointmentRepository.save(appointment);
  }

  async remove(id: number, doctorId: number): Promise<void> {
    // Verificar que el appointment pertenece al doctor antes de eliminar
    const appointment = await this.findOne(id, doctorId);
    await this.appointmentRepository.remove(appointment);
  }

  async findUpcomingByDoctor(doctorId: number): Promise<Appointment[]> {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patientTreatment', 'patientTreatment')
      .leftJoinAndSelect('patientTreatment.patient', 'patient')
      .leftJoinAndSelect('patientTreatment.doctor', 'doctor')
      .leftJoinAndSelect('patientTreatment.treatment', 'treatment')
      .where('patientTreatment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.status IN (:...statuses)', { 
        statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS] 
      })
      .orderBy('appointment.appointmentDate', 'ASC')
      .getMany();
  }
}

