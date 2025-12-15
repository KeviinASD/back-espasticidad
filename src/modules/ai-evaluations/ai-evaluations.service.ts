import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiEvaluation } from './entity/ai-evaluation.entity';
import { CreateAiEvaluationDto } from './dto/create-ai-evaluation.dto';
import { UpdateAiEvaluationDto } from './dto/update-ai-evaluation.dto';
import { SelectAiEvaluationDto } from './dto/select-ai-evaluation.dto';

@Injectable()
export class AiEvaluationsService {
  constructor(
    @InjectRepository(AiEvaluation)
    private aiEvaluationRepository: Repository<AiEvaluation>,
  ) {}

  async create(createAiEvaluationDto: CreateAiEvaluationDto): Promise<AiEvaluation> {
    // Verificar si ya existe una evaluación para este appointment y aiTool
    const existing = await this.aiEvaluationRepository.findOne({
      where: {
        appointmentId: createAiEvaluationDto.appointmentId,
        aiToolId: createAiEvaluationDto.aiToolId
      }
    });

    if (existing) {
      throw new BadRequestException('Ya existe una evaluación para este appointment y herramienta de IA');
    }

    const aiEvaluation = this.aiEvaluationRepository.create(createAiEvaluationDto);
    return await this.aiEvaluationRepository.save(aiEvaluation);
  }

  async findAll(): Promise<AiEvaluation[]> {
    return await this.aiEvaluationRepository.find({
      relations: ['appointment', 'aiTool'],
      order: { evaluationDate: 'DESC' }
    });
  }

  async findOne(id: number): Promise<AiEvaluation> {
    const aiEvaluation = await this.aiEvaluationRepository.findOne({
      where: { evaluationId: id },
      relations: ['appointment', 'aiTool']
    });
    
    if (!aiEvaluation) {
      throw new NotFoundException(`AI Evaluation with ID ${id} not found`);
    }
    
    return aiEvaluation;
  }

  async findByAppointment(appointmentId: number): Promise<AiEvaluation[]> {
    return await this.aiEvaluationRepository.find({
      where: { appointmentId },
      relations: ['aiTool'],
      order: { evaluationDate: 'DESC' }
    });
  }

  async selectEvaluation(evaluationId: number, selectDto: SelectAiEvaluationDto): Promise<AiEvaluation> {
    const evaluation = await this.findOne(evaluationId);

    // Deseleccionar cualquier otra evaluación seleccionada para este appointment
    await this.aiEvaluationRepository.update(
      { appointmentId: evaluation.appointmentId, isSelected: true },
      { isSelected: false }
    );

    // Seleccionar esta evaluación
    evaluation.isSelected = true;
    if (selectDto.justification) {
      evaluation.justification = selectDto.justification;
    }

    return await this.aiEvaluationRepository.save(evaluation);
  }

  async update(id: number, updateAiEvaluationDto: UpdateAiEvaluationDto): Promise<AiEvaluation> {
    const aiEvaluation = await this.findOne(id);
    
    Object.assign(aiEvaluation, updateAiEvaluationDto);
    
    return await this.aiEvaluationRepository.save(aiEvaluation);
  }

  async remove(id: number): Promise<void> {
    const aiEvaluation = await this.findOne(id);
    await this.aiEvaluationRepository.remove(aiEvaluation);
  }
}

