import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { AuthController } from './controllers/auth.controller';
import { InitController } from './controllers/init.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './controllers/users.controller';
import { ProfilesController } from './controllers/profile.controller';
import { TextblocksController } from './controllers/textblocks.controller';
import { TokensController } from './controllers/tokens.controller';
import { FilesController } from './controllers/file.controller';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '../src/exceptions/filter';
import { RabbitMQClient } from './rabbitmq.client';
import { AboutUser } from './guards/aboutUser';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `../.env`,
    }),
  ],
  controllers: [
    AuthController,
    InitController,
    UsersController,
    ProfilesController,
    TextblocksController,
    TokensController,
    FilesController,
  ],
  providers: [
    RabbitMQClient,
    AboutUser,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class ApiModule {}
