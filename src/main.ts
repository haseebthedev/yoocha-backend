import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // or specify the domains you want to allow
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(bodyParser.json({}));
  app.use(bodyParser.urlencoded({}));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const PORT = process.env.PORT || 7777
  await app.listen(PORT);
}
bootstrap();
