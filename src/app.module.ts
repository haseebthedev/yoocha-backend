import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { EventsModule } from './modules/events/events.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ObjectIdInterceptor, ResultInterceptor } from './common/interceptors';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { FileModule } from './modules/file/file.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AppController } from './app.controller';
import { TokenModule } from './modules/token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    AuthModule,
    UserModule,
    ChatModule,
    EventsModule,
    CloudinaryModule,
    FileModule,
    NotificationModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResultInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ObjectIdInterceptor,
    },
  ],
})
export class AppModule {}
