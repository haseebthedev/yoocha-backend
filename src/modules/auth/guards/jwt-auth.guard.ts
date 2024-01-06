import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}

@Injectable()
export class WSJwtAuthGuard extends AuthGuard('ws-jwt') {
  constructor() {
    super();
  }
}
