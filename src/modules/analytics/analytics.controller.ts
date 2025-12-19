import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('statistics')
  async getStatistics(@Query('period') period?: string) {
    return await this.analyticsService.getStatistics(period);
  }

  @Get('prevalence')
  async getPrevalence() {
    return await this.analyticsService.getPrevalence();
  }

  @Get('severity-breakdown')
  async getSeverityBreakdown() {
    return await this.analyticsService.getSeverityBreakdown();
  }

  @Get('recent-evaluations')
  async getRecentEvaluations(@Query('limit') limit?: string) {
    return await this.analyticsService.getRecentEvaluations(limit ? parseInt(limit) : 10);
  }

  @Get('ai-preferences')
  async getAiPreferences(@Query('period') period?: string) {
    return await this.analyticsService.getAiPreferences(period);
  }

  @Get('kpis')
  async getKpis(@Query('period') period?: string) {
    return await this.analyticsService.getKpis(period);
  }
}

