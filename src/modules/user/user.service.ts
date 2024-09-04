import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery, PaginateModel, PaginateOptions } from 'mongoose';
import { generateRandomDigits } from 'src/common/utils/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { ChangePassDTO, ContactUsDTO, UpdateProfileDTO } from './dto';
import { SignUpDTO } from '../auth/dto';
import * as bcrypt from 'bcrypt';
import { createSMTPTransporter } from 'src/common/utils';
import { AccountStatus } from 'src/common/enums/user.enum';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: PaginateModel<User>) {}

  async create(dto: SignUpDTO): Promise<User> {
    const userInDB = await this.userModel.findOne({ email: dto.email });
    if (userInDB) {
      throw new ConflictException('User already exists with this email');
    }

    const user = new this.userModel({ ...dto, accountStatus: AccountStatus.ACTIVE });
    return user.save();
  }

  async find(query: FilterQuery<User>, paginateOptions?: PaginateOptions) {
    return await this.userModel.paginate(query, paginateOptions);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();

    if (user) return user;
    else throw new NotFoundException(`User with email ${email} not found`);
  }

  async findById(userId: string): Promise<User | null> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    return user;
  }

  async findByIdandUpdate(userId: string, dto: Partial<UpdateProfileDTO>): Promise<User> {
    console.log('ok');
    const user = await this.userModel.findByIdAndUpdate(userId, dto, { new: true }).exec();

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    user.authCode = undefined;
    user.password = undefined;
    return user;
  }

  async findByIdAndDelete(userId: string): Promise<{ result: string }> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { accountStatus: AccountStatus.DELETED }, { new: true })
      .exec();

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    return {
      result: 'Successfully deleted account.',
    };
  }

  async findAll(filters?: FilterQuery<User>): Promise<User[]> {
    return await this.userModel.find(filters ? filters : {}).exec();
  }

  async forgotPassword(email: string): Promise<{ result: string }> {
    const userInDB = await this.userModel.findOne({ email: email });
    if (!userInDB) throw new NotFoundException(`User with email ${email} not found`);

    const OTPCode = generateRandomDigits(6);
    userInDB.authCode = OTPCode.toString();
    await userInDB.save();

    return {
      result: 'Please check your email.',
    };
  }

  async resetPassword(email: string, authCode: string, newPassword: string): Promise<{ result: string }> {
    const user = await this.userModel.findOne({ email: email });

    if (!user) throw new NotFoundException(`User with email ${email} not found`);
    if (user.authCode !== authCode) throw new BadRequestException(`You have entered an invalid authcode`);

    user.password = newPassword;
    await user.save();

    return {
      result: 'Your account password has been reset.',
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

  async contactUs(dto: ContactUsDTO) {
    if (!dto.name || !dto.email || !dto.message) {
      throw new BadRequestException('All fields are required.');
    }

    const transporter = createSMTPTransporter();

    const mailOptions = {
      from: dto.email,
      to: process.env.CONTACT_EMAIL,
      subject: 'Yoocha Support Request: User Inquiry',
      text: `Name: ${dto.name}\nEmail: ${dto.email}\nMessage: ${dto.message}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { message: 'Message sent successfully!!' };
    } catch (error) {
      throw new BadRequestException('Failed to send message. Please try again later.');
    }
  }

  async getUser(userId: string) {
    if (!userId) {
      throw new BadRequestException('UserId is required.');
    }

    const user = await this.userModel.findById(userId);
    return user;
  }
}
