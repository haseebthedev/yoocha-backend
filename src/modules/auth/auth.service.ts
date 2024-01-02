import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ForgotPassDTO, ResetPassDTO, SignInDTO, SignUpDTO } from './dto';
import { User } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const jwtSecret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
      secret: jwtSecret,
    });

    return { access_token: token };
  }

  async signin(dto: SignInDTO): Promise<User> {
    let user = await this.userService.findByEmail(dto.email);

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Either email or password is invalid');
    }
    user.password = undefined;
    user.authCode = undefined;
    return user;
  }

  async signup(dto: SignUpDTO): Promise<User> {
    const user = await this.userService.create(dto);
    user.password = undefined;
    user.authCode = undefined;
    return user;
  }

  async forgotPassword(dto: ForgotPassDTO): Promise<{ result: string }> {
    return await this.userService.forgotPassword(dto.email);
  }

  async resetPassword(dto: ResetPassDTO): Promise<{ result: string }> {
    return await this.userService.resetPassword(
      dto.email,
      dto.authCode,
      dto.newPassword,
    );
  }
}
