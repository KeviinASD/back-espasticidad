import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/security/users.module';
import { PatientModule } from './modules/patient/patient.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { PatientTreatmentsModule } from './modules/patient-treatments/patient-treatments.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AppointmentAnswersModule } from './modules/appointment-answers/appointment-answers.module';
import { DiagnosesModule } from './modules/diagnoses/diagnoses.module';
import { AiToolsModule } from './modules/ai-tools/ai-tools.module';
import { AiEvaluationsModule } from './modules/ai-evaluations/ai-evaluations.module';
import { SystemLogsModule } from './modules/system-logs/system-logs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config, configService, DatabaseConfig } from './config/env.config';
import { ConfigModule } from '@nestjs/config';
import dbConfig from './config/db.config';
import { SeedingService } from './config/seeding.service';
import { Treatment } from './modules/treatments/entity/treatment.entity';

const c: DatabaseConfig = config.database();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      /* Ejm de expandVariables:
        DB_NAME=example
        URL=${DB_NAME}.com # Esto se expandirá a "example.com"
      */
      expandVariables: true,
      load: [dbConfig]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const db = dbConfig();
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          autoLoadEntities: db.autoLoadEntities,
          synchronize: db.synchronize,
        };
      }
    }),
    TypeOrmModule.forFeature([Treatment]),
    AuthModule, 
    UsersModule,
    PatientModule,
    TreatmentsModule,
    PatientTreatmentsModule,
    QuestionsModule,
    AppointmentsModule,
    AppointmentAnswersModule,
    DiagnosesModule,
    AiToolsModule,
    AiEvaluationsModule,
    SystemLogsModule,
  ],
  controllers: [],
  providers: [SeedingService],
})
export class AppModule {}
