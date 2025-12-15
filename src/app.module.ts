import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/security/users.module';
import { PatientModule } from './modules/patient/patient.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config, configService, DatabaseConfig } from './config/env.config';
import { ConfigModule } from '@nestjs/config';
import dbConfig from './config/db.config';

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
    AuthModule, 
    UsersModule,
    PatientModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
