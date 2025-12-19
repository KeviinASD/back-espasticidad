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

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      relations: ['patientTreatment', 'patientTreatment.patient', 'patientTreatment.doctor', 'patientTreatment.treatment'],
      order: { appointmentDate: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId: id },
      relations: ['patientTreatment', 'patientTreatment.patient', 'patientTreatment.doctor', 'patientTreatment.treatment', 'appointmentAnswers', 'appointmentAnswers.question', 'diagnoses', 'aiEvaluations', 'aiEvaluations.aiTool']
    });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return appointment;
  }

  async findByPatientTreatment(patientTreatmentId: number): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: { patientTreatmentId },
      relations: ['patientTreatment', 'patientTreatment.patient', 'patientTreatment.doctor', 'patientTreatment.treatment'],
      order: { appointmentDate: 'DESC' }
    });
  }

  async findByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: { status },
      relations: ['patientTreatment', 'patientTreatment.patient', 'patientTreatment.doctor', 'patientTreatment.treatment'],
      order: { appointmentDate: 'DESC' }
    });
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    
    Object.assign(appointment, updateAppointmentDto);
    
    return await this.appointmentRepository.save(appointment);
  }

  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);
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

