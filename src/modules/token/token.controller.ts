import { Controller, Post, Body, Get, Query, Delete } from '@nestjs/common';
import { TokenService } from './token.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('save-token')
  async saveToken(@Body() createTokenDto: CreateTokenDto) {
    return this.tokenService.saveToken(createTokenDto);
  }

  @Get('get-token')
  async getToken(@Query('userId', MongoIdValidationPipe) userId: string) {
    return this.tokenService.getToken(userId);
  }

  @Delete('remove-token')
  async removeToken(@Query('userId', MongoIdValidationPipe) userId: string, @Query('token') fcmToken: string) {
    return this.tokenService.removeToken(userId, fcmToken);
  }
}
