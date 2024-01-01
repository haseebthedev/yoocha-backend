import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}

  async signin(dto: any): Promise<any> {
    return 'Signing in user...';
  }
}
