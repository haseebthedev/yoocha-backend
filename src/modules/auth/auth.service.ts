import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ForgotPassDTO, ResetPassDTO, SignInDTO, SignUpDTO } from './dto';
import * as argon from 'argon2';
import { User } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';

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
      expiresIn: '1d',
      secret: jwtSecret,
    });

    return { access_token: token };
  }

  async signin(dto: SignInDTO): Promise<User> {
    let user = await this.userService.findByEmail(dto.email);

    let isPassMatch = await argon.verify(user.password, dto.password);
    if (!isPassMatch) {
      throw new UnauthorizedException('Either email or password is invalid');
    }
    user.password = undefined;
    return user;
  }

  async signup(dto: SignUpDTO): Promise<User> {
    const hash = await argon.hash(dto.password);
    dto.password = hash;

    const user = await this.userService.create(dto);
    user.password = undefined;
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
