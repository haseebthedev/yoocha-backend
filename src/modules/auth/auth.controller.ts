import { Body, Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('signin')
  async signin(@Body() dto: any) {
    console.log('signin controller...');
    return this.authService.signin(dto);
    // return this.authService.signToken('dsf', 'dsf');
  }
}
