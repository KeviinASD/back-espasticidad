
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { RoleTier } from "src/common/enums/role.enum";
import { Role } from "./role.entity";
import { PatientTreatment } from "../../patient-treatments/entity/patient-treatment.entity";
import { SystemLog } from "../../system-logs/entity/system-log.entity";

@Entity({name: 'user'})
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({unique: true})
    email: string;

    @Column({})
    password: string;

    @Column({ name: 'full_name', type: 'varchar', length: 100, nullable: true })
    fullName: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'enum', enum: RoleTier, default: RoleTier.User })
    roleTier: RoleTier;

    @ManyToOne(type => Role, role => role.users)
    @JoinColumn({ name: 'roleId' })
    role: Role;

    // Relaciones de Doctor
    @OneToMany(() => PatientTreatment, (patientTreatment) => patientTreatment.doctor)
    patientTreatments: PatientTreatment[];

    @OneToMany(() => SystemLog, (systemLog) => systemLog.doctor)
    systemLogs: SystemLog[];
}
