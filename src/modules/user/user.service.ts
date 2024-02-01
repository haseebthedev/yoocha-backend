import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { SignUpDTO } from '../auth/dto';
import { generateRandomDigits } from 'src/common/utils/common';
import { ChangePassDTO, UpdateProfileDTO } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(dto: SignUpDTO): Promise<User> {
    try {
      const userInDB = await this.userModel.findOne({ email: dto.email });
      if (userInDB) {
        throw new ConflictException('User already exists with this email');
      }

      const user = new this.userModel(dto);
      return user.save();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (user) return user;
      else throw new NotFoundException(`User with email ${email} not found`);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(userId: string): Promise<User | null> {
    try {
      const user = await this.userModel.findById(userId).exec();

      if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByIdandUpdate(userId: string, dto: UpdateProfileDTO): Promise<User> {
    try {
      const user = await this.userModel.findByIdAndUpdate(userId, dto).exec();

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      user.authCode = undefined;
      user.password = undefined;
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
    try {
      const userInDB = await this.userModel.findOne({ email: email });
      if (!userInDB) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      const OTPCode = generateRandomDigits(6);
      userInDB.authCode = OTPCode.toString();
      await userInDB.save();

      return {
        result: 'Please check your email.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async resetPassword(email: string, authCode: string, newPassword: string): Promise<{ result: string }> {
    try {
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
        result: 'Your account password has been reset.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changePassword(userId: string, dto: ChangePassDTO) {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
