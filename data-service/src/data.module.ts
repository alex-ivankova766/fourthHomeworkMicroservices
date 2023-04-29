import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfileModule } from './profile/profile.module';
import { TextblocksModule } from './textblocks/textblocks.module';
import { Profile } from './profile/profile.model';
import { TextBlock } from './textblocks/textblocks.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `../.env`
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT_INSIDE),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATA_DB,
      models: [Profile, TextBlock],
      autoLoadModels: true,
    }),
    ProfileModule,
    TextblocksModule,
    ProfileModule
]
})
export class DataModule {}
