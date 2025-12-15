import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentAnswersService } from './appointment-answers.service';
import { AppointmentAnswersController } from './appointment-answers.controller';
import { AppointmentAnswer } from './entity/appointment-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppointmentAnswer])],
  controllers: [AppointmentAnswersController],
  providers: [AppointmentAnswersService],
  exports: [AppointmentAnswersService],
})
export class AppointmentAnswersModule {}

