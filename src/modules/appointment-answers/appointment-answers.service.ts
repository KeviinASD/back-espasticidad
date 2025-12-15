import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentAnswer } from './entity/appointment-answer.entity';
import { CreateAppointmentAnswerDto } from './dto/create-appointment-answer.dto';
import { UpdateAppointmentAnswerDto } from './dto/update-appointment-answer.dto';
import { CreateMultipleAnswersDto } from './dto/create-multiple-answers.dto';

@Injectable()
export class AppointmentAnswersService {
  constructor(
    @InjectRepository(AppointmentAnswer)
    private appointmentAnswerRepository: Repository<AppointmentAnswer>,
  ) {}

  async create(createAppointmentAnswerDto: CreateAppointmentAnswerDto): Promise<AppointmentAnswer> {
    const appointmentAnswer = this.appointmentAnswerRepository.create(createAppointmentAnswerDto);
    return await this.appointmentAnswerRepository.save(appointmentAnswer);
  }

  async createMultiple(createMultipleAnswersDto: CreateMultipleAnswersDto): Promise<AppointmentAnswer[]> {
    const answers = createMultipleAnswersDto.answers.map(answer => 
      this.appointmentAnswerRepository.create({
        appointmentId: createMultipleAnswersDto.appointmentId,
        questionId: answer.questionId,
        numericValue: answer.numericValue
      })
    );
    return await this.appointmentAnswerRepository.save(answers);
  }

  async findAll(): Promise<AppointmentAnswer[]> {
    return await this.appointmentAnswerRepository.find({
      relations: ['appointment', 'question'],
      order: { answerId: 'ASC' }
    });
  }

  async findOne(id: number): Promise<AppointmentAnswer> {
    const appointmentAnswer = await this.appointmentAnswerRepository.findOne({
      where: { answerId: id },
      relations: ['appointment', 'question']
    });
    
    if (!appointmentAnswer) {
      throw new NotFoundException(`Appointment answer with ID ${id} not found`);
    }
    
    return appointmentAnswer;
  }

  async findByAppointment(appointmentId: number): Promise<AppointmentAnswer[]> {
    return await this.appointmentAnswerRepository.find({
      where: { appointmentId },
      relations: ['question'],
      order: { questionId: 'ASC' }
    });
  }

  async update(id: number, updateAppointmentAnswerDto: UpdateAppointmentAnswerDto): Promise<AppointmentAnswer> {
    const appointmentAnswer = await this.findOne(id);
    
    Object.assign(appointmentAnswer, updateAppointmentAnswerDto);
    
    return await this.appointmentAnswerRepository.save(appointmentAnswer);
  }

  async remove(id: number): Promise<void> {
    const appointmentAnswer = await this.findOne(id);
    await this.appointmentAnswerRepository.remove(appointmentAnswer);
  }

  async removeByAppointment(appointmentId: number): Promise<void> {
    await this.appointmentAnswerRepository.delete({ appointmentId });
  }
}

