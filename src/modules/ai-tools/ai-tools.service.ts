import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiTool } from './entity/ai-tool.entity';
import { CreateAiToolDto } from './dto/create-ai-tool.dto';
import { UpdateAiToolDto } from './dto/update-ai-tool.dto';

@Injectable()
export class AiToolsService {
  constructor(
    @InjectRepository(AiTool)
    private aiToolRepository: Repository<AiTool>,
  ) {}

  async create(createAiToolDto: CreateAiToolDto): Promise<AiTool> {
    const aiTool = this.aiToolRepository.create(createAiToolDto);
    return await this.aiToolRepository.save(aiTool);
  }

  async findAll(): Promise<AiTool[]> {
    return await this.aiToolRepository.find({
      order: { name: 'ASC' }
    });
  }

  async findOne(id: number): Promise<AiTool> {
    const aiTool = await this.aiToolRepository.findOne({
      where: { aiToolId: id }
    });
    
    if (!aiTool) {
      throw new NotFoundException(`AI Tool with ID ${id} not found`);
    }
    
    return aiTool;
  }

  async update(id: number, updateAiToolDto: UpdateAiToolDto): Promise<AiTool> {
    const aiTool = await this.findOne(id);
    
    Object.assign(aiTool, updateAiToolDto);
    
    return await this.aiToolRepository.save(aiTool);
  }

  async remove(id: number): Promise<void> {
    const aiTool = await this.findOne(id);
    await this.aiToolRepository.remove(aiTool);
  }
}

