import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async createOrUpdateOAuthUser(profile: any): Promise<User> {
    let user = await this.findByEmail(profile.email);

    if (user) {
      // Update existing user with OAuth information
      user.googleId = profile.id;
      user.provider = 'google';
      if (!user.isEmailVerified) {
        user.isEmailVerified = true; // Trust Google's email verification
      }
      return this.usersRepository.save(user);
    } else {
      // Create new user from OAuth
      const newUser = this.usersRepository.create({
        email: profile.email,
        googleId: profile.id,
        provider: 'google',
        isEmailVerified: true,
      });
      return this.usersRepository.save(newUser);
    }
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }
}
