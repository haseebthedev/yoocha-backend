import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { SignUpDTO } from '../auth/dto';
import { generateRandomDigits } from 'src/common/utils/common';
import { ChangePassDTO, UpdateProfileDTO } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly config: ConfigService,
  ) {}

  async create(dto: SignUpDTO): Promise<User> {
    const userInDB = await this.userModel.findOne({ email: dto.email });
    if (userInDB) {
      throw new ConflictException('User already exists with this email');
    }

    const user = new this.userModel(dto);
    return user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    let user = await this.userModel.findOne({ email }).exec();

    if (user) return user;
    else throw new NotFoundException(`User with email ${email} not found`);
  }

  async findById(userId: string): Promise<User | null> {
    try {
      return await this.userModel.findById(userId).exec();
    } catch (error) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async findByIdandUpdate(
    userId: string,
    dto: UpdateProfileDTO,
  ): Promise<User> {
    try {
      return await this.userModel.findByIdAndUpdate(userId, dto).exec();
    } catch (error) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async forgotPassword(email: string): Promise<{ result: string }> {
    const userInDB = await this.userModel.findOne({ email: email });

    if (!userInDB) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    let OTPCode = generateRandomDigits(6);
    userInDB.authCode = OTPCode.toString();
    await userInDB.save();

    return {
      result: 'Please check your email.',
    };
  }

  async resetPassword(
    email: string,
    authCode: string,
    newPassword: string,
  ): Promise<{ result: string }> {
    const user = await this.userModel.findOne({ email: email });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (user.authCode !== authCode) {
      throw new BadRequestException(`You have entered an invalid authcode`);
    }

    user.password = newPassword;
    await user.save();

    return {
      result: 'Your account password has been reset. Try login again.',
    };
  }

  async changePassword(userId: string, dto: ChangePassDTO) {
    const user = await this.userModel.findById(userId);

    const isPassMatch = await bcrypt.compare(dto.oldPassword, user.password);

    if (!isPassMatch) {
      throw new BadRequestException('Your current password is not correct.');
    }
    user.password = dto.newPassword;
    await user.save();

    user.password = undefined;
    user.authCode = undefined;

    return { result: 'Your password has been changed successfully.' };
  }
}
