import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTokenDto } from './dto/create-token.dto';
import { Token } from './schemas/token.schema';

@Injectable()
export class TokenService {
  constructor(@InjectModel('Token') private readonly tokenModel: Model<Token>) {}

  async saveToken(createTokenDto: CreateTokenDto) {
    const existingToken = await this.tokenModel.findOne({
      userId: createTokenDto.userId,
      token: createTokenDto.token,
    });

    if (existingToken) {
      throw new HttpException('Token already exists for this user', HttpStatus.BAD_REQUEST);
    }

    const newToken = new this.tokenModel(createTokenDto);
    return newToken.save();
  }

  async getToken(userId: string): Promise<{ docs: Token[] }> {
    try {
      const tokens = await this.tokenModel.find({ userId });

      if (!tokens || tokens.length === 0) {
        throw new NotFoundException(`No tokens found for userId: ${userId}`);
      }

      return { docs: tokens };
    } catch (err) {
      console.error('Error fetching tokens:', err);
      return { docs: [] };
    }
  }

  async removeToken(userId: string, fcmToken: string): Promise<{ result: string }> {
    const existingToken = await this.tokenModel.findOne({ userId, token: fcmToken });

    if (!existingToken) {
      throw new HttpException('Token not found', HttpStatus.BAD_REQUEST);
    }

    await this.tokenModel.findOneAndDelete({ userId, token: fcmToken });
    return { result: 'Successfully deleted token' };
  }
}
