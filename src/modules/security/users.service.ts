import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignUpParams } from 'src/common/utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  
  async createOne(createUserDetails: CreateUserDto){
    const userEntity = this.userRepository.create(createUserDetails);
    return this.userRepository.save(userEntity);
  }

  async findOneById(id: number) {
    const user = await this.userRepository.findOne({where: {id}});
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOne(email: string) {
    return this.userRepository.findOne({where: {email}});
  }
  
  async createHandle(createUserDetails: CreateUserDto) {
    const user = await this.userRepository.findOne({where: {email: createUserDetails.email}});
    if (user) throw new UnauthorizedException('Email already exists');

    return await this.createOne(createUserDetails);
  }
  
  async findOneByEmailHandle(email: string) {
    const user = await this.userRepository.findOne({where: {email}});
    if (!user) throw new UnauthorizedException('Email not found');
    return user;
  }

  async findByIdWithRole(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions']
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    const {password, ...result} = user;
    return result;
  }
  
  async findAll() {
    return this.userRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);
    
    // Si se actualiza la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    Object.assign(user, updateUserDto);
    
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOneById(id);
    await this.userRepository.remove(user);
  }
}
