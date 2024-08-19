// src/token/token.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { TokenSchema } from './schemas/token.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }])],
  providers: [TokenService],
  controllers: [TokenController],
})
export class TokenModule {}
