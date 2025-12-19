import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AiEvaluationsService } from './ai-evaluations.service';
import { CreateAiEvaluationDto } from './dto/create-ai-evaluation.dto';
import { UpdateAiEvaluationDto } from './dto/update-ai-evaluation.dto';
import { SelectAiEvaluationDto } from './dto/select-ai-evaluation.dto';
import { GenerateAiEvaluationDto } from './dto/generate-ai-evaluation.dto';

@Controller('ai-evaluations')
export class AiEvaluationsController {
  constructor(private readonly aiEvaluationsService: AiEvaluationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAiEvaluationDto: CreateAiEvaluationDto) {
    return this.aiEvaluationsService.create(createAiEvaluationDto);
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  generateWithAI(@Body() generateDto: GenerateAiEvaluationDto) {
    return this.aiEvaluationsService.generateWithCopilot(generateDto);
  }

  @Post(':id/select')
  @HttpCode(HttpStatus.OK)
  selectEvaluation(
    @Param('id', ParseIntPipe) id: number,
    @Body() selectDto: SelectAiEvaluationDto
  ) {
    return this.aiEvaluationsService.selectEvaluation(id, selectDto);
  }

  @Get()
  findAll(@Query('appointmentId') appointmentId?: string) {
    if (appointmentId) {
      return this.aiEvaluationsService.findByAppointment(parseInt(appointmentId));
    }
    return this.aiEvaluationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.aiEvaluationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAiEvaluationDto: UpdateAiEvaluationDto
  ) {
    return this.aiEvaluationsService.update(id, updateAiEvaluationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.aiEvaluationsService.remove(id);
  }
}

