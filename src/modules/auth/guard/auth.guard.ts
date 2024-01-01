import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authToken = request.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new UnauthorizedException('No auth token provided');
    }

    try {
      const validToken = this.validate(authToken);
      if (validToken) {
        const user = { id: 1, email: 'haseeb@gmail.com' };
        request.user = user;
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  async validate(token: string): Promise<JWTToken> {
    const jwt = this.parseToken(token);
    if (this.isTokenExpired(jwt)) {
      const jwt = this.parseToken(token);
      throw new UnauthorizedException('Token has expired');
    }
    return jwt;
  }

  isTokenExpired(jwt: JWTToken): boolean {
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
      throw new UnauthorizedException('Failed to parse JWT token');
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
