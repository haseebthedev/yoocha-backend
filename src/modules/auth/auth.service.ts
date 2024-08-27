import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { User } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { ForgotPassDTO, ResetPassDTO, SignInDTO, SignUpDTO } from './dto';
import * as bcrypt from 'bcrypt';
import { JWTDecodedUserI } from 'src/interfaces';
import { NotificationType } from 'src/common/enums/notifications.enum';
import { TokenService } from '../token/token.service';
import { NotificationService } from '../notification/notification.service';
import { Types } from 'mongoose';
import { AccountStatus } from 'src/common/enums/user.enum';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
    private tokenService: TokenService,
    private notificationService: NotificationService,
  ) {}

  async signToken(userId: string, email: string): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const jwtSecret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
      secret: jwtSecret,
    });
    return { access_token: token };
  }

  async verifyToken(token: string): Promise<Partial<JWTDecodedUserI>> {
    try {
      const jwtSecret = await this.config.get('JWT_SECRET');
      const decoded = await this.jwt.verify(token, { secret: jwtSecret });

      if (!decoded) {
        throw new UnauthorizedException('Token is invalid or expired');
      }
      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Token is invalid');
    }
  }

  async signin(dto: SignInDTO): Promise<{ user: User; token: string }> {
    const user = await this.userService.findByEmail(dto.email);
    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Either email or password is invalid');
    }

    if (user.accountStatus != AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active!');
    }

    const token = await this.signToken(user._id, user.email);

    const fcmToken = await this.tokenService.saveToken({ userId: user._id.toString(), token: dto.fcmToken });

    if (user.isFirstSignIn && fcmToken) {
      await this.notificationService.createNotification(
        {
          fcmToken: dto.fcmToken,
          type: NotificationType.ONBOARDING,
          isRead: false,
          sendPushNotification: true,
          message: `Welcome to Yoocha. Discover the best way to use our app. Tap to start your journey!`,
          to: new Types.ObjectId(user._id),
        },
        user._id,
      );

      await this.userService.findByIdandUpdate(user._id, { isFirstSignIn: false });
      user.isFirstSignIn = false;
    }

    return { user, token: token.access_token };
  }

  async signup(dto: SignUpDTO): Promise<User> {
    return await this.userService.create(dto);
  }

  async forgotPassword(dto: ForgotPassDTO): Promise<{ result: string }> {
    return await this.userService.forgotPassword(dto.email);
  }

  async resetPassword(dto: ResetPassDTO): Promise<{ result: string }> {
    return await this.userService.resetPassword(dto.email, dto.authCode, dto.newPassword);
  }
}
