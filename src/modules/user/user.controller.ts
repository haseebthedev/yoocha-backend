import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ChangePassDTO, UpdateProfileDTO } from './dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards';
import { GetUser } from 'src/common/decorators';
import { User } from './schemas/user.schema';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getProfile(@GetUser() user: User) {
    return await this.userService.findById(user._id);
  }

  @Patch('me')
  async updateProfile(@GetUser() user: User, @Body() dto: UpdateProfileDTO) {
    return await this.userService.findByIdandUpdate(user._id, dto);
  }

  @Post('change-password')
  async changePassword(@GetUser() user: User, @Body() dto: ChangePassDTO) {
    return await this.userService.changePassword(user._id, dto);
  }
}
