import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { AuthController } from './controllers/auth.controller';
import { InitController } from './controllers/init.controller';
import { ConfigModule } from "@nestjs/config";
import { UsersController } from './controllers/users.controller';
import { ProfilesController } from './controllers/profile.controller';
import { TextblocksController } from './controllers/textblocks.controller';
import { TokensController } from './controllers/tokens.controller';
import { FilesController } from './controllers/file.controller';

@Module({
  imports: [
    ConfigModule.forRoot( { 
      envFilePath: `../.env`
  }),
    ClientsModule.register([
      {
        name: 'ACCESS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL],
          queue: process.env.ACCESS_QUEUE,
          queueOptions: {
            durable: false,
          },
        },
      },  
      {
        name: 'DATA_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.CLOUDAMQP_URL],
          queue: process.env.DATA_QUEUE,
          queueOptions: {
            durable: false,
          },
        },
      },  
    ]),
  ],
  controllers: [
      AuthController, 
      InitController,
      UsersController,
      ProfilesController,
      TextblocksController,
      TokensController,
      FilesController
  ],
})
export class ApiModule {}