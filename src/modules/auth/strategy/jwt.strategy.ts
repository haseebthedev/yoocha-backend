import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountStatus } from 'src/common/enums/user.enum';
import { User } from 'src/modules/user/schemas/user.schema';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<User> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid token provided');
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active.');
    }

    // if (user.accountStatus !== AccountStatus.ACTIVE) {
    //   throw new UnauthorizedException('Your account is not active');
    // }

    user.authCode = undefined;
    user.password = undefined;

    return user;
  }
}
