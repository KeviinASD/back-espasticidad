import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../security/entities/user.entity';

@Entity('system_logs')
export class SystemLog {
  @PrimaryGeneratedColumn({ name: 'log_id' })
  logId: number;

  @Column({ name: 'doctor_id', type: 'int', nullable: true })
  doctorId: number;

  @Column({ name: 'action', type: 'varchar', length: 50, nullable: true })
  action: string;

  @CreateDateColumn({ name: 'log_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  logDate: Date;

  @ManyToOne(() => User, (user) => user.systemLogs, { nullable: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;
}

