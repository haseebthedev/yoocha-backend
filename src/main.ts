import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { exec } from 'child_process';

async function clearPort() {
  const port = process.env.PORT || 10000;

  if (port) {
    const command = `kill $(lsof -t -i:${port})`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        return;
      }
      if (stderr) {
        console.error(`Error in command output: ${stderr}`);
        return;
      }
      console.log(`Command output: ${stdout}`);
    });
  } else {
    console.error('Port number is not defined in process.env.PORT');
  }
}

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
  await clearPort()
  await app.listen(process.env.PORT || 10000);
}
bootstrap();
