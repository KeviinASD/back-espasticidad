import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentAnswer } from './entity/appointment-answer.entity';
import { CreateAppointmentAnswerDto } from './dto/create-appointment-answer.dto';
import { UpdateAppointmentAnswerDto } from './dto/update-appointment-answer.dto';
import { CreateMultipleAnswersDto } from './dto/create-multiple-answers.dto';
import { Question } from '../questions/entity/question.entity';

@Injectable()
export class AppointmentAnswersService {
  constructor(
    @InjectRepository(AppointmentAnswer)
    private appointmentAnswerRepository: Repository<AppointmentAnswer>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async create(createAppointmentAnswerDto: CreateAppointmentAnswerDto): Promise<AppointmentAnswer> {
    try {
      // Validar que la pregunta existe
      const question = await this.questionRepository.findOne({
        where: { questionId: createAppointmentAnswerDto.questionId }
      });
      
      if (!question) {
        throw new BadRequestException(
          `La pregunta con ID ${createAppointmentAnswerDto.questionId} no existe. Por favor, ejecute el seed de preguntas.`
        );
      }
      
      // Validar que numericValue no sea null si se proporciona
      if (createAppointmentAnswerDto.numericValue === null) {
        throw new BadRequestException(
          'El valor numérico no puede ser null. Use undefined o no incluya el campo si no hay valor.'
        );
      }
      
      const appointmentAnswer = this.appointmentAnswerRepository.create(createAppointmentAnswerDto);
      return await this.appointmentAnswerRepository.save(appointmentAnswer);
    } catch (error) {
      // Si ya es un BadRequestException, relanzarlo
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Para otros errores, proporcionar un mensaje más descriptivo
      throw new BadRequestException(
        `Error al crear la respuesta: ${error.message}. Verifique que appointmentId y questionId sean válidos.`
      );
    }
  }

  async createMultiple(createMultipleAnswersDto: CreateMultipleAnswersDto): Promise<AppointmentAnswer[]> {
    // Validar que todas las preguntas existen
    const questionIds = createMultipleAnswersDto.answers.map(a => a.questionId);
    const questions = await this.questionRepository.find({
      where: questionIds.map(id => ({ questionId: id }))
    });
    
    const foundQuestionIds = questions.map(q => q.questionId);
    const missingQuestionIds = questionIds.filter(id => !foundQuestionIds.includes(id));
    
    if (missingQuestionIds.length > 0) {
      throw new BadRequestException(
        `Las siguientes preguntas no existen: ${missingQuestionIds.join(', ')}. Por favor, ejecute el seed de preguntas.`
      );
    }
    
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

