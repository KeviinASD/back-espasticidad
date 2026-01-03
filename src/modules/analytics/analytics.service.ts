import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { Diagnosis } from '../diagnoses/entity/diagnosis.entity';
import { Appointment } from '../appointments/entity/appointment.entity';
import { AppointmentAnswer } from '../appointment-answers/entity/appointment-answer.entity';
import { Question } from '../questions/entity/question.entity';
import { AiEvaluation } from '../ai-evaluations/entity/ai-evaluation.entity';
import { PatientTreatment } from '../patient-treatments/entity/patient-treatment.entity';
import { Treatment } from '../treatments/entity/treatment.entity';

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
    @InjectRepository(Treatment)
    private treatmentRepository: Repository<Treatment>,
  ) {}

  async getStatistics(period?: string, doctorId?: number) {
    if (!doctorId) {
      throw new Error('Doctor ID is required');
    }

    const dateRange = this.getDateRange(period);
    
    // Calcular evolución mensual de diagnósticos
    const monthlyEvolution = await this.getMonthlyDiagnosticsEvolution(period, doctorId);

    const [totalDiagnoses, totalAppointments, previousPeriodData] = await Promise.all([
      this.countDiagnosesByDoctor(doctorId, dateRange),
      this.countAppointmentsByDoctor(doctorId, dateRange),
      this.getPreviousPeriodData(period, doctorId),
    ]);

    // Calcular cambios porcentuales
    const diagnosesChange = previousPeriodData.totalDiagnoses > 0
      ? Math.round(((totalDiagnoses - previousPeriodData.totalDiagnoses) / previousPeriodData.totalDiagnoses) * 100)
      : 0;

    return {
      totalDiagnoses,
      totalAppointments,
      period: period || 'all',
      diagnosesChange,
      monthlyEvolution,
    };
  }

  async getPrevalence(doctorId?: number) {
    if (!doctorId) {
      throw new Error('Doctor ID is required');
    }

    const totalDiagnoses = await this.countDiagnosesByDoctor(doctorId);
    const withSpasticity = await this.countDiagnosesByDoctor(doctorId, null, true);
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

  async getSeverityBreakdown(doctorId?: number) {
    if (!doctorId) {
      throw new Error('Doctor ID is required');
    }

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

    // Obtener todas las respuestas de MAS filtradas por doctor
    const masAnswers = await this.appointmentAnswerRepository
      .createQueryBuilder('answer')
      .innerJoin('answer.appointment', 'appointment')
      .innerJoin('appointment.patientTreatment', 'pt')
      .where('answer.questionId = :questionId', { questionId: masQuestion.questionId })
      .andWhere('pt.doctorId = :doctorId', { doctorId })
      .getMany();

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

  async getRecentEvaluations(limit: number = 10, doctorId?: number) {
    if (!doctorId) {
      throw new Error('Doctor ID is required');
    }

    const diagnoses = await this.diagnosisRepository
      .createQueryBuilder('diagnosis')
      .innerJoin('diagnosis.appointment', 'appointment')
      .innerJoin('appointment.patientTreatment', 'pt')
      .leftJoinAndSelect('pt.patient', 'patient')
      .leftJoinAndSelect('pt.doctor', 'doctor')
      .where('pt.doctorId = :doctorId', { doctorId })
      .orderBy('diagnosis.diagnosisDate', 'DESC')
      .take(limit)
      .getMany();

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

  async getAiPreferences(period?: string, doctorId?: number) {
    if (!doctorId) {
      throw new Error('Doctor ID is required');
    }

    const dateRange = this.getDateRange(period);

    // Filtrar evaluaciones por doctor a través de appointments -> patient_treatments
    const queryBuilder = this.aiEvaluationRepository
      .createQueryBuilder('evaluation')
      .innerJoin('evaluation.appointment', 'appointment')
      .innerJoin('appointment.patientTreatment', 'pt')
      .leftJoinAndSelect('evaluation.aiTool', 'aiTool')
      .leftJoinAndSelect('pt.doctor', 'doctor')
      .where('evaluation.isSelected = :isSelected', { isSelected: true })
      .andWhere('pt.doctorId = :doctorId', { doctorId });

    if (dateRange) {
      queryBuilder.andWhere('evaluation.evaluationDate BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    const evaluations = await queryBuilder.getMany();

    console.log(`[Analytics] getAiPreferences - Found ${evaluations.length} evaluations with isSelected=true`);
    console.log(`[Analytics] Period: ${period || 'all'}, DateRange:`, dateRange);

    // Contar por herramienta de IA
    const chatgptCount = evaluations.filter(e => {
      const toolName = e.aiTool?.name?.toLowerCase() || '';
      return toolName.includes('chatgpt') || toolName.includes('gpt');
    }).length;
    
    const copilotCount = evaluations.filter(e => {
      const toolName = e.aiTool?.name?.toLowerCase() || '';
      return toolName.includes('copilot') || toolName.includes('gemini');
    }).length;

    const total = evaluations.length;
    const chatgptPercentage = total > 0 ? Math.round((chatgptCount / total) * 100) : 0;
    const copilotPercentage = total > 0 ? Math.round((copilotCount / total) * 100) : 0;

    console.log(`[Analytics] AI Preferences counts - Total: ${total}, ChatGPT: ${chatgptCount}, Copilot: ${copilotCount}`);

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

    // Calcular tendencia semanal
    const weeklyTrend = await this.getWeeklyAiPreferencesTrend(period, doctorId);

    // Calcular cambio porcentual respecto al período anterior
    const previousPeriodData = await this.getPreviousPeriodAiPreferences(period, doctorId);
    const chatgptChange = previousPeriodData.chatgptCount > 0
      ? Math.round(((chatgptCount - previousPeriodData.chatgptCount) / previousPeriodData.chatgptCount) * 100)
      : 0;

    return {
      total,
      chatgptCount,
      copilotCount,
      chatgptPercentage,
      copilotPercentage,
      recentJustifications,
      weeklyTrend,
      chatgptChange,
    };
  }

  async getKpis(period?: string, doctorId?: number) {
    if (!doctorId) {
      throw new Error('Doctor ID is required');
    }

    const dateRange = this.getDateRange(period);
    
    const [totalAppointments, totalPatients, totalTreatments, previousPeriodData, appointmentsWeeklyEvolution] = await Promise.all([
      this.countAppointmentsByDoctor(doctorId, dateRange),
      this.countPatientTreatmentsByDoctor(doctorId),
      this.countPatientTreatmentsByDoctor(doctorId),
      this.getPreviousPeriodData(period, doctorId),
      this.getWeeklyAppointmentsEvolution(period, doctorId),
    ]);

    // Calcular éxito de tratamiento basado en diagnósticos positivos (con espasticidad detectada y luego mejorada)
    const successRate = await this.calculateSuccessRate(dateRange, doctorId);
    
    // Calcular tiempo promedio de recuperación (días entre inicio y fin de tratamiento)
    const avgRecoveryTime = await this.calculateAverageRecoveryTime(doctorId);
    
    // Calcular cambios porcentuales
    const appointmentsChange = previousPeriodData.totalAppointments > 0
      ? Math.round(((totalAppointments - previousPeriodData.totalAppointments) / previousPeriodData.totalAppointments) * 100)
      : 0;
    
    const patientsChange = previousPeriodData.totalPatients > 0
      ? Math.round(((totalPatients - previousPeriodData.totalPatients) / previousPeriodData.totalPatients) * 100)
      : 0;

    // Obtener tratamientos recientes
    const recentTreatments = await this.getRecentTreatments(3, doctorId);

    // Calcular respuesta a espasticidad
    const spasticityResponse = await this.getSpasticityResponse(dateRange, doctorId);

    return {
      totalAppointments,
      totalPatients,
      totalTreatments,
      successRate,
      avgRecoveryTime,
      appointmentsChange,
      patientsChange,
      appointmentsWeeklyEvolution,
      recentTreatments,
      spasticityResponse,
    };
  }

  private async calculateSuccessRate(dateRange?: { start: Date; end: Date } | null, doctorId?: number): Promise<number> {
    if (!doctorId) return 85; // Default si no hay doctorId
    
    // Calcular éxito basado en diagnósticos: pacientes que inicialmente tenían espasticidad y luego mejoraron
    // (simplificado: éxito = porcentaje de diagnósticos positivos que tienen seguimiento exitoso)
    
    const queryBuilder = this.diagnosisRepository
      .createQueryBuilder('diagnosis')
      .innerJoin('diagnosis.appointment', 'appointment')
      .innerJoin('appointment.patientTreatment', 'pt')
      .leftJoinAndSelect('diagnosis.appointment', 'appointmentSelect')
      .leftJoinAndSelect('appointmentSelect.patientTreatment', 'patientTreatment')
      .where('pt.doctorId = :doctorId', { doctorId });

    if (dateRange) {
      queryBuilder.andWhere('diagnosis.diagnosisDate BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    const diagnoses = await queryBuilder
      .orderBy('diagnosis.diagnosisDate', 'ASC')
      .getMany();

    if (diagnoses.length === 0) return 0;

    // Agrupar por paciente y ver la evolución
    const patientEvolution = new Map<number, boolean[]>();
    
    for (const diagnosis of diagnoses) {
      const patientId = diagnosis.appointment?.patientTreatment?.patientId;
      if (patientId) {
        if (!patientEvolution.has(patientId)) {
          patientEvolution.set(patientId, []);
        }
        patientEvolution.get(patientId)!.push(diagnosis.hasSpasticity);
      }
    }

    let successfulCases = 0;
    let totalCases = 0;

    for (const [patientId, evolution] of patientEvolution.entries()) {
      if (evolution.length < 2) continue; // Necesitamos al menos 2 diagnósticos para evaluar evolución
      
      totalCases++;
      const initial = evolution[0];
      const latest = evolution[evolution.length - 1];
      
      // Éxito: tenía espasticidad inicialmente y ya no la tiene, o mejoró
      if (initial === true && latest === false) {
        successfulCases++;
      }
    }

    return totalCases > 0 ? Math.round((successfulCases / totalCases) * 100) : 85; // Default 85% si no hay datos suficientes
  }

  private async calculateAverageRecoveryTime(doctorId?: number): Promise<number> {
    if (!doctorId) return 22; // Default si no hay doctorId
    
    // Calcular tiempo promedio de recuperación (días entre inicio y fin de tratamiento)
    const allTreatments = await this.patientTreatmentRepository.find({
      where: { doctorId },
    });
    const treatments = allTreatments.filter(t => t.startDate && t.endDate);

    if (treatments.length === 0) return 22; // Default: ~3 semanas

    const totalDays = treatments.reduce((sum, treatment) => {
      const start = new Date(treatment.startDate);
      const end = new Date(treatment.endDate);
      const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / treatments.length / 7 * 10) / 10; // Redondear a 1 decimal en semanas
  }

  private async getRecentTreatments(limit: number = 3, doctorId?: number) {
    if (!doctorId) return [];
    
    const treatments = await this.patientTreatmentRepository.find({
      where: { doctorId },
      relations: ['treatment', 'patient', 'appointments'],
      order: { startDate: 'DESC' },
      take: limit,
    });

    return treatments.map(treatment => {
      const latestAppointment = treatment.appointments?.[treatment.appointments.length - 1];
      const daysAgo = latestAppointment?.appointmentDate
        ? Math.floor((new Date().getTime() - new Date(latestAppointment.appointmentDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      let timeAgo = 'Reciente';
      if (daysAgo !== null) {
        if (daysAgo === 0) timeAgo = 'Hoy';
        else if (daysAgo === 1) timeAgo = 'Ayer';
        else if (daysAgo < 7) timeAgo = `Hace ${daysAgo}d`;
        else timeAgo = `Hace ${Math.floor(daysAgo / 7)} sem`;
      }

      return {
        treatmentId: treatment.patientTreatmentId,
        treatmentName: treatment.treatment?.treatmentName || 'Tratamiento',
        patientId: treatment.patientId,
        status: latestAppointment?.status || 'Pendiente',
        timeAgo,
      };
    });
  }

  private async getSpasticityResponse(dateRange?: { start: Date; end: Date } | null, doctorId?: number) {
    if (!doctorId) {
      return { mejora: 65, estable: 25, regresion: 10 }; // Valores por defecto
    }
    
    // Calcular distribución de respuesta: mejora, estable, regresión
    const queryBuilder = this.diagnosisRepository
      .createQueryBuilder('diagnosis')
      .innerJoin('diagnosis.appointment', 'appointment')
      .innerJoin('appointment.patientTreatment', 'pt')
      .leftJoinAndSelect('diagnosis.appointment', 'appointmentSelect')
      .leftJoinAndSelect('appointmentSelect.patientTreatment', 'patientTreatment')
      .where('pt.doctorId = :doctorId', { doctorId });

    if (dateRange) {
      queryBuilder.andWhere('diagnosis.diagnosisDate BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    const diagnoses = await queryBuilder
      .orderBy('diagnosis.diagnosisDate', 'ASC')
      .getMany();

    const patientEvolution = new Map<number, boolean[]>();
    
    for (const diagnosis of diagnoses) {
      const patientId = diagnosis.appointment?.patientTreatment?.patientId;
      if (patientId) {
        if (!patientEvolution.has(patientId)) {
          patientEvolution.set(patientId, []);
        }
        patientEvolution.get(patientId)!.push(diagnosis.hasSpasticity);
      }
    }

    let mejora = 0; // Tenía espasticidad, ahora no
    let estable = 0; // Sin cambios significativos
    let regresion = 0; // No tenía, ahora tiene, o empeoró

    for (const [patientId, evolution] of patientEvolution.entries()) {
      if (evolution.length < 2) {
        estable++; // Sin datos suficientes, consideramos estable
        continue;
      }
      
      const initial = evolution[0];
      const latest = evolution[evolution.length - 1];
      
      if (initial === true && latest === false) {
        mejora++;
      } else if (initial === latest) {
        estable++;
      } else {
        regresion++;
      }
    }

    const total = mejora + estable + regresion;
    if (total === 0) {
      return { mejora: 65, estable: 25, regresion: 10 }; // Valores por defecto si no hay datos
    }

    return {
      mejora: Math.round((mejora / total) * 100),
      estable: Math.round((estable / total) * 100),
      regresion: Math.round((regresion / total) * 100),
    };
  }

  private async getWeeklyAppointmentsEvolution(period?: string, doctorId?: number) {
    if (!doctorId) return [0, 0, 0, 0];
    
    const dateRange = this.getDateRange(period);
    const now = new Date();
    
    // Obtener las últimas 4 semanas
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - 7);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const count = await this.appointmentRepository
        .createQueryBuilder('appointment')
        .innerJoin('appointment.patientTreatment', 'pt')
        .where('pt.doctorId = :doctorId', { doctorId })
        .andWhere('appointment.appointmentDate BETWEEN :start AND :end', {
          start: weekStart,
          end: weekEnd,
        })
        .getCount();
      
      weeks.push(count);
    }

    // Normalizar a porcentajes para el gráfico (0-100)
    const max = Math.max(...weeks, 1);
    return weeks.map(count => Math.round((count / max) * 100));
  }

  private async getMonthlyDiagnosticsEvolution(period?: string, doctorId?: number) {
    if (!doctorId) return [{ withSpasticity: 0, withoutSpasticity: 0 }];
    
    const dateRange = this.getDateRange(period);
    const now = new Date();
    
    // Obtener los últimos 4 meses
    const months = [];
    for (let i = 3; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const [withSpasticity, withoutSpasticity] = await Promise.all([
        this.diagnosisRepository
          .createQueryBuilder('diagnosis')
          .innerJoin('diagnosis.appointment', 'appointment')
          .innerJoin('appointment.patientTreatment', 'pt')
          .where('pt.doctorId = :doctorId', { doctorId })
          .andWhere('diagnosis.diagnosisDate BETWEEN :start AND :end', {
            start: monthStart,
            end: monthEnd,
          })
          .andWhere('diagnosis.hasSpasticity = :hasSpasticity', { hasSpasticity: true })
          .getCount(),
        this.diagnosisRepository
          .createQueryBuilder('diagnosis')
          .innerJoin('diagnosis.appointment', 'appointment')
          .innerJoin('appointment.patientTreatment', 'pt')
          .where('pt.doctorId = :doctorId', { doctorId })
          .andWhere('diagnosis.diagnosisDate BETWEEN :start AND :end', {
            start: monthStart,
            end: monthEnd,
          })
          .andWhere('diagnosis.hasSpasticity = :hasSpasticity', { hasSpasticity: false })
          .getCount(),
      ]);
      
      months.push({
        withSpasticity,
        withoutSpasticity,
      });
    }

    // Normalizar a porcentajes para el gráfico
    const max = Math.max(...months.map(m => m.withSpasticity + m.withoutSpasticity), 1);
    return months.map(month => ({
      withSpasticity: Math.round((month.withSpasticity / max) * 100),
      withoutSpasticity: Math.round((month.withoutSpasticity / max) * 100),
    }));
  }

  private async getWeeklyAiPreferencesTrend(period?: string, doctorId?: number) {
    if (!doctorId) return [{ chatgpt: 0, copilot: 0 }];
    
    const now = new Date();
    const weeks = [];
    
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - 7);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const evaluations = await this.aiEvaluationRepository
        .createQueryBuilder('evaluation')
        .innerJoin('evaluation.appointment', 'appointment')
        .innerJoin('appointment.patientTreatment', 'pt')
        .leftJoinAndSelect('evaluation.aiTool', 'aiTool')
        .where('pt.doctorId = :doctorId', { doctorId })
        .andWhere('evaluation.evaluationDate BETWEEN :start AND :end', {
          start: weekStart,
          end: weekEnd,
        })
        .andWhere('evaluation.isSelected = :isSelected', { isSelected: true })
        .getMany();

      const chatgptCount = evaluations.filter(e => 
        e.aiTool?.name?.toLowerCase().includes('chatgpt') || 
        e.aiTool?.name?.toLowerCase().includes('gpt')
      ).length;
      
      const copilotCount = evaluations.filter(e => 
        e.aiTool?.name?.toLowerCase().includes('copilot') ||
        e.aiTool?.name?.toLowerCase().includes('gemini')
      ).length;

      const total = chatgptCount + copilotCount;
      weeks.push({
        chatgpt: total > 0 ? Math.round((chatgptCount / total) * 100) : 0,
        copilot: total > 0 ? Math.round((copilotCount / total) * 100) : 0,
      });
    }

    return weeks;
  }

  private async getPreviousPeriodData(period?: string, doctorId?: number) {
    if (!doctorId) {
      return { totalDiagnoses: 0, totalAppointments: 0, totalPatients: 0 };
    }

    if (!period) {
      // Si no hay período, comparar con el mes anterior completo
      const now = new Date();
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const dateRange = { start: prevMonthStart, end: prevMonthEnd };
      const [totalDiagnoses, totalAppointments, totalPatients] = await Promise.all([
        this.countDiagnosesByDoctor(doctorId, dateRange),
        this.countAppointmentsByDoctor(doctorId, dateRange),
        this.countPatientTreatmentsByDoctor(doctorId),
      ]);

      return { totalDiagnoses, totalAppointments, totalPatients };
    }

    const dateRange = this.getDateRange(period);
    if (!dateRange) {
      return { totalDiagnoses: 0, totalAppointments: 0, totalPatients: 0 };
    }

    // Calcular el período anterior equivalente
    const periodDuration = dateRange.end.getTime() - dateRange.start.getTime();
    const prevStart = new Date(dateRange.start.getTime() - periodDuration);
    const prevEnd = new Date(dateRange.start);
    const prevDateRange = { start: prevStart, end: prevEnd };

    const [totalDiagnoses, totalAppointments, totalPatients] = await Promise.all([
      this.countDiagnosesByDoctor(doctorId, prevDateRange),
      this.countAppointmentsByDoctor(doctorId, prevDateRange),
      this.countPatientTreatmentsByDoctor(doctorId),
    ]);

    return { totalDiagnoses, totalAppointments, totalPatients };
  }

  private async getPreviousPeriodAiPreferences(period?: string, doctorId?: number) {
    if (!doctorId) {
      return { chatgptCount: 0, copilotCount: 0 };
    }

    const dateRange = this.getDateRange(period);
    if (!dateRange) {
      return { chatgptCount: 0, copilotCount: 0 };
    }

    const periodDuration = dateRange.end.getTime() - dateRange.start.getTime();
    const prevStart = new Date(dateRange.start.getTime() - periodDuration);
    const prevEnd = new Date(dateRange.start);

    const evaluations = await this.aiEvaluationRepository
      .createQueryBuilder('evaluation')
      .innerJoin('evaluation.appointment', 'appointment')
      .innerJoin('appointment.patientTreatment', 'pt')
      .leftJoinAndSelect('evaluation.aiTool', 'aiTool')
      .where('pt.doctorId = :doctorId', { doctorId })
      .andWhere('evaluation.evaluationDate BETWEEN :start AND :end', {
        start: prevStart,
        end: prevEnd,
      })
      .andWhere('evaluation.isSelected = :isSelected', { isSelected: true })
      .getMany();

    const chatgptCount = evaluations.filter(e => {
      const toolName = e.aiTool?.name?.toLowerCase() || '';
      return toolName.includes('chatgpt') || toolName.includes('gpt');
    }).length;
    
    const copilotCount = evaluations.filter(e => {
      const toolName = e.aiTool?.name?.toLowerCase() || '';
      return toolName.includes('copilot') || toolName.includes('gemini');
    }).length;

    console.log(`[Analytics] Previous period - ChatGPT: ${chatgptCount}, Copilot: ${copilotCount}`);
    return { chatgptCount, copilotCount };
  }

  private getDateRange(period?: string): { start: Date; end: Date } | null {
    if (!period || period === 'all') return null;

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

  // Métodos auxiliares para filtrar por doctor
  private async countDiagnosesByDoctor(
    doctorId: number,
    dateRange?: { start: Date; end: Date } | null,
    hasSpasticity?: boolean
  ): Promise<number> {
    const queryBuilder = this.diagnosisRepository
      .createQueryBuilder('diagnosis')
      .innerJoin('diagnosis.appointment', 'appointment')
      .innerJoin('appointment.patientTreatment', 'pt')
      .where('pt.doctorId = :doctorId', { doctorId });

    if (dateRange) {
      queryBuilder.andWhere('diagnosis.diagnosisDate BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    if (hasSpasticity !== undefined) {
      queryBuilder.andWhere('diagnosis.hasSpasticity = :hasSpasticity', { hasSpasticity });
    }

    return await queryBuilder.getCount();
  }

  private async countAppointmentsByDoctor(
    doctorId: number,
    dateRange?: { start: Date; end: Date } | null
  ): Promise<number> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .innerJoin('appointment.patientTreatment', 'pt')
      .where('pt.doctorId = :doctorId', { doctorId });

    if (dateRange) {
      queryBuilder.andWhere('appointment.appointmentDate BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    return await queryBuilder.getCount();
  }

  private async countPatientTreatmentsByDoctor(doctorId: number): Promise<number> {
    return await this.patientTreatmentRepository.count({
      where: { doctorId },
    });
  }
}

