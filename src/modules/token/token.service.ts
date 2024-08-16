import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTokenDto } from './dto/create-token.dto';
import { Token } from './schemas/token.schema';

@Injectable()
export class TokenService {
  constructor(@InjectModel('Token') private readonly tokenModel: Model<Token>) {}

  async saveToken(createTokenDto: CreateTokenDto): Promise<Token> {
    const newToken = new this.tokenModel(createTokenDto);
    return newToken.save();
  }

  async getToken(userId: string): Promise<{ docs: Token[] }> {
    const tokens = await this.tokenModel.find({ userId: userId });
    return { docs: tokens };
  }

  async removeToken(userId: string): Promise<{ docs: Token[] }> {
    const tokens = await this.tokenModel.find({ userId: userId });
    return { docs: tokens };
  }
}
