import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Diagnosis } from '../diagnoses/entity/diagnosis.entity';
import { Appointment } from '../appointments/entity/appointment.entity';
import { AppointmentAnswer } from '../appointment-answers/entity/appointment-answer.entity';
import { Question } from '../questions/entity/question.entity';
import { AiEvaluation } from '../ai-evaluations/entity/ai-evaluation.entity';
import { PatientTreatment } from '../patient-treatments/entity/patient-treatment.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Diagnosis)
    private diagnosisRepository: Repository<Diagnosis>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(AppointmentAnswer)
    private appointmentAnswerRepository: Repository<AppointmentAnswer>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(AiEvaluation)
    private aiEvaluationRepository: Repository<AiEvaluation>,
    @InjectRepository(PatientTreatment)
    private patientTreatmentRepository: Repository<PatientTreatment>,
  ) {}

  async getStatistics(period?: string) {
    const dateRange = this.getDateRange(period);
    
    const [totalDiagnoses, totalAppointments] = await Promise.all([
      dateRange
        ? this.diagnosisRepository.count({
            where: {
              diagnosisDate: Between(dateRange.start, dateRange.end),
            },
          })
        : this.diagnosisRepository.count(),
      dateRange
        ? this.appointmentRepository.count({
            where: {
              appointmentDate: Between(dateRange.start, dateRange.end),
            },
          })
        : this.appointmentRepository.count(),
    ]);

    return {
      totalDiagnoses,
      totalAppointments,
      period: period || 'all',
    };
  }

  async getPrevalence() {
    const totalDiagnoses = await this.diagnosisRepository.count();
    const withSpasticity = await this.diagnosisRepository.count({
      where: { hasSpasticity: true },
    });
    const withoutSpasticity = totalDiagnoses - withSpasticity;

    const percentage = totalDiagnoses > 0 
      ? Math.round((withSpasticity / totalDiagnoses) * 100) 
      : 0;

    return {
      total: totalDiagnoses,
      withSpasticity,
      withoutSpasticity,
      percentage,
    };
  }

  async getSeverityBreakdown() {
    // Obtener la pregunta MAS
    const masQuestion = await this.questionRepository.findOne({
      where: { questionText: 'Modified Ashworth Scale (MAS)' },
    });

    if (!masQuestion) {
      return {
        grade1: 0,
        grade2: 0,
        grade3: 0,
        grade4: 0,
        total: 0,
      };
    }

    // Obtener todas las respuestas de MAS
    const masAnswers = await this.appointmentAnswerRepository.find({
      where: { questionId: masQuestion.questionId },
      relations: ['appointment'],
    });

    // Clasificar por grado
    let grade1 = 0; // 0, 1, 1.5
    let grade2 = 0; // 2
    let grade3 = 0; // 3
    let grade4 = 0; // 4

    for (const answer of masAnswers) {
      if (answer.numericValue === null) continue;
      
      const value = answer.numericValue;
      if (value === 0 || value === 1 || value === 1.5) {
        grade1++;
      } else if (value === 2) {
        grade2++;
      } else if (value === 3) {
        grade3++;
      } else if (value === 4) {
        grade4++;
      }
    }

    const total = grade1 + grade2 + grade3 + grade4;

    return {
      grade1: total > 0 ? Math.round((grade1 / total) * 100) : 0,
      grade2: total > 0 ? Math.round((grade2 / total) * 100) : 0,
      grade3: total > 0 ? Math.round((grade3 / total) * 100) : 0,
      grade4: total > 0 ? Math.round((grade4 / total) * 100) : 0,
      total,
    };
  }

  async getRecentEvaluations(limit: number = 10) {
    const diagnoses = await this.diagnosisRepository.find({
      relations: ['appointment', 'appointment.patientTreatment', 'appointment.patientTreatment.patient', 'appointment.patientTreatment.doctor'],
      order: { diagnosisDate: 'DESC' },
      take: limit,
    });

    return diagnoses.map((diagnosis) => {
      const patient = diagnosis.appointment?.patientTreatment?.patient;
      const doctor = diagnosis.appointment?.patientTreatment?.doctor;
      
      return {
        diagnosisId: diagnosis.diagnosisId,
        patientName: patient?.fullName || 'Paciente',
        doctorName: doctor?.fullName || doctor?.username || 'Doctor',
        hasSpasticity: diagnosis.hasSpasticity,
        diagnosisSummary: diagnosis.diagnosisSummary,
        diagnosisDate: diagnosis.diagnosisDate,
        appointmentId: diagnosis.appointmentId,
      };
    });
  }

  async getAiPreferences(period?: string) {
    const dateRange = this.getDateRange(period);
    
    const whereCondition = dateRange
      ? { evaluationDate: Between(dateRange.start, dateRange.end), isSelected: true }
      : { isSelected: true };

    const evaluations = await this.aiEvaluationRepository.find({
      where: whereCondition,
      relations: [
        'aiTool',
        'appointment',
        'appointment.patientTreatment',
        'appointment.patientTreatment.doctor',
      ],
    });

    // Contar por herramienta de IA
    const chatgptCount = evaluations.filter(e => 
      e.aiTool?.name?.toLowerCase().includes('chatgpt') || 
      e.aiTool?.name?.toLowerCase().includes('gpt')
    ).length;
    
    const copilotCount = evaluations.filter(e => 
      e.aiTool?.name?.toLowerCase().includes('copilot') ||
      e.aiTool?.name?.toLowerCase().includes('gemini')
    ).length;

    const total = evaluations.length;
    const chatgptPercentage = total > 0 ? Math.round((chatgptCount / total) * 100) : 0;
    const copilotPercentage = total > 0 ? Math.round((copilotCount / total) * 100) : 0;

    // Obtener justificaciones recientes
    const recentJustifications = evaluations
      .filter(e => e.justification)
      .slice(0, 10)
      .map(e => {
        const doctor = e.appointment?.patientTreatment?.doctor;
        return {
          doctorName: doctor?.fullName || doctor?.username || 'Dr. Usuario',
          toolName: e.aiTool?.name || 'IA',
          justification: e.justification,
          date: e.evaluationDate,
        };
      });

    return {
      total,
      chatgptCount,
      copilotCount,
      chatgptPercentage,
      copilotPercentage,
      recentJustifications,
    };
  }

  async getKpis(period?: string) {
    const dateRange = this.getDateRange(period);
    
    const [totalAppointments, totalPatients, totalTreatments] = await Promise.all([
      dateRange
        ? this.appointmentRepository.count({
            where: { appointmentDate: Between(dateRange.start, dateRange.end) },
          })
        : this.appointmentRepository.count(),
      this.patientTreatmentRepository.count(),
      this.patientTreatmentRepository.count(),
    ]);

    // Calcular éxito de tratamiento (simplificado - basado en diagnósticos positivos)
    const successRate = 85; // TODO: calcular basado en datos reales

    return {
      totalAppointments,
      totalPatients,
      totalTreatments,
      successRate,
    };
  }

  private getDateRange(period?: string): { start: Date; end: Date } | null {
    if (!period) return null;

    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (period) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return null;
    }

    return { start, end };
  }
}

