import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards';
import { GetUser } from 'src/common/decorators';
import { User } from './schemas/user.schema';
import { ChangePassDTO } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getMyProfile(@GetUser() user: User) {
    return this.userService.findById(user._id);
  }

  @Post('change-password')
  async changePassword(@GetUser() user: User, @Body() dto: ChangePassDTO) {
    return this.userService.changePassword(user._id, dto);
  }
}
