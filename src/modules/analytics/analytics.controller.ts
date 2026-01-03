import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { JwtPayloadParams } from 'src/common/utils/types';
import { User } from 'src/modules/security/entities/user.entity';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('statistics')
  async getStatistics(
    @ActiveUser() user: Omit<User, 'password'>,
    @Query('period') period?: string
  ) {
    const doctorId = user.id;
    if (!doctorId) {
      throw new Error('Usuario no autenticado o sin ID');
    }
    return await this.analyticsService.getStatistics(period, doctorId);
  }

  @Get('prevalence')
  async getPrevalence(@ActiveUser() user: Omit<User, 'password'>) {
    const doctorId = user.id;
    if (!doctorId) {
      throw new Error('Usuario no autenticado o sin ID');
    }
    return await this.analyticsService.getPrevalence(doctorId);
  }

  @Get('severity-breakdown')
  async getSeverityBreakdown(@ActiveUser() user: Omit<User, 'password'>) {
    const doctorId = user.id;
    if (!doctorId) {
      throw new Error('Usuario no autenticado o sin ID');
    }
    return await this.analyticsService.getSeverityBreakdown(doctorId);
  }

  @Get('recent-evaluations')
  async getRecentEvaluations(
    @ActiveUser() user: Omit<User, 'password'>,
    @Query('limit') limit?: string
  ) {
    const doctorId = user.id;
    if (!doctorId) {
      throw new Error('Usuario no autenticado o sin ID');
    }
    return await this.analyticsService.getRecentEvaluations(
      limit ? parseInt(limit) : 10,
      doctorId
    );
  }

  @Get('ai-preferences')
  async getAiPreferences(
    @ActiveUser() user: Omit<User, 'password'>,
    @Query('period') period?: string
  ) {
    const doctorId = user.id;
    if (!doctorId) {
      throw new Error('Usuario no autenticado o sin ID');
    }
    return await this.analyticsService.getAiPreferences(period, doctorId);
  }

  @Get('kpis')
  async getKpis(
    @ActiveUser() user: Omit<User, 'password'>,
    @Query('period') period?: string
  ) {
    const doctorId = user.id;
    if (!doctorId) {
      throw new Error('Usuario no autenticado o sin ID');
    }
    return await this.analyticsService.getKpis(period, doctorId);
  }
}

