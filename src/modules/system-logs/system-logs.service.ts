import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLog } from './entity/system-log.entity';
import { CreateSystemLogDto } from './dto/create-system-log.dto';

@Injectable()
export class SystemLogsService {
  constructor(
    @InjectRepository(SystemLog)
    private systemLogRepository: Repository<SystemLog>,
  ) {}

  async create(createSystemLogDto: CreateSystemLogDto): Promise<SystemLog> {
    const systemLog = this.systemLogRepository.create(createSystemLogDto);
    return await this.systemLogRepository.save(systemLog);
  }

  async findAll(): Promise<SystemLog[]> {
    return await this.systemLogRepository.find({
      relations: ['doctor'],
      order: { logDate: 'DESC' }
    });
  }

  async findByDoctor(doctorId: number): Promise<SystemLog[]> {
    return await this.systemLogRepository.find({
      where: { doctorId },
      relations: ['doctor'],
      order: { logDate: 'DESC' }
    });
  }
}

