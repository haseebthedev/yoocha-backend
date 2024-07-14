import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('/healthCheck')
  async healthCheck() {
    return {
      status: 'OK',
      message: 'The server is up and running.',
    };
  }
}
