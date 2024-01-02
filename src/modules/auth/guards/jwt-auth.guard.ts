import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authToken = request.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new UnauthorizedException('No auth token provided');
    }
    const validToken = this.validate(authToken);
    try {
      // Use validToken to get user email from token and get user details from db;
      const user = { _id: '123', email: 'haseeb@gmail.com' };
      request.user = user;
      return true;
    } catch (err) {
      return false;
    }
  }

  public validate(token: string) {
    const jwt = this.parseToken(token);
    if (this.isTokenExpired(jwt)) {
      const jwt = this.parseToken(token);
      throw new UnauthorizedException('Token has expired');
    }
    return jwt;
  }

  protected isTokenExpired(jwt: JWTToken): boolean {
    const exp = parseInt(jwt.content.exp);
    if (exp * 1000 > Date.now()) {
      return false;
    }
    return true;
  }

  protected parseToken(token: string): JWTToken {
    try {
      const parts = token.split('.');
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      const content = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const signature = Buffer.from(parts[2], 'base64').toString();
      const signed = parts[0] + '.' + parts[1];

      const jwtToken = new JWTToken();
      jwtToken.token = token;
      jwtToken.header = header;
      jwtToken.content = content;
      jwtToken.signed = signed;
      jwtToken.signature = signature;

      return jwtToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid token provided');
    }
  }
}

export class JWTToken {
  token: string = '';
  header: any = '';
  content: any = '';
  signed: string = '';
  signature: string = '';
}
