import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { TokensService } from './tokens/tokens.service';
import { UsersModule } from 'src/users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Token } from './tokens/tokens.model';
import { InitialService } from './initial/initial.service';
import { RolesModule } from 'src/roles/roles.module';
import { VkoauthService } from './vkoauth/vkoauth.service';

@Module({
  providers: [ AuthService, TokensService, InitialService, VkoauthService ],
  controllers: [ AuthController ],
  imports: [  JwtModule.register({}),
              SequelizeModule.forFeature([Token]),
              UsersModule,
              RolesModule],
  exports: [ TokensService, JwtModule ]
})
export class AuthModule {}
