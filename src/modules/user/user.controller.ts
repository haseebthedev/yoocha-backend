import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards';
import { GetUser } from 'src/common/decorators';
import { User } from './schemas/user.schema';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getMyProfile(@GetUser() user: User) {
    return this.userService.findById(user._id.toString());
  }
}
