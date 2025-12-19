import { Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@Controller('seed')
@UseGuards(JwtAuthGuard)
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @Post('questions')
  @HttpCode(HttpStatus.OK)
  async seedQuestions() {
    return await this.seedingService.seedQuestions();
  }

  @Post('all')
  @HttpCode(HttpStatus.OK)
  async seedAll() {
    return await this.seedingService.seed();
  }
}

