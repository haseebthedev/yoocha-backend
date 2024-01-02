import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignInDTO, SignUpDTO } from './dto';
import * as argon from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/schemas/user.schema';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  async signin(dto: SignInDTO): Promise<any> {
    let user = await this.userService.findByEmail(dto.email);

    let isPasswordMatch = await argon.verify(user.password, dto.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Either email or password is invalid');
    }

    user.password = undefined;
    return user;
  }

  async signup(dto: SignUpDTO): Promise<any> {
    const hash = await argon.hash(dto.password);
    dto.password = hash;

    const user = await this.userService.create(dto);
    user.password = undefined;

    return user;
  }

  async signToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    const jwtSecret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: jwtSecret,
    });

    return {
      access_token: token,
    };
  }
}
