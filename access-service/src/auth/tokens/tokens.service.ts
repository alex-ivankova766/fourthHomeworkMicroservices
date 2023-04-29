import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UsersService } from 'src/users/users.service';
import { Token } from './tokens.model';
import { UserDto } from '../../dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import { concatAll } from 'rxjs';

@Injectable()
export class TokensService {
    constructor(@InjectModel(Token) private tokenRepo: typeof Token,
    private readonly userService: UsersService,
    private jwtService: JwtService
    ){}

async generateAndSaveToken(payload : UserDto) {

    const refreshToken = this.jwtService.sign({...payload}, {secret: process.env.JWT_REFRESH_SECRET, expiresIn: '30d' });
    const accessToken = this.jwtService.sign({...payload}, {secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' });
    await this.saveToken(payload.id, refreshToken);
   
    return {refreshToken, accessToken}

}

async updateRefreshToken(newData : Object, id: number) {

    const tokenFromDB =  await this.tokenRepo.findOne({where: {id: id}});
    const refreshToken = tokenFromDB.refreshToken;
    const oldUserData = await this.validateRefreshToken(refreshToken);
    const newUserData = await {...oldUserData, ...newData}
    const tokenData = new UserDto(newUserData)
    const tokens = await this.generateAndSaveToken(tokenData)
   
    return {refreshToken: tokens.refreshToken, accessToken: tokens.accessToken}

}

async validateRefreshToken(token) : Promise<UserDto> {
    try {
        const userData = this.jwtService.verify(token, {secret: process.env.JWT_REFRESH_SECRET});
        return userData;
    } catch(e) {
        return null;
    } 
}

async validateAccessToken(token) : Promise<UserDto>{
    try {
        const userData = this.jwtService.verify(token, {secret: process.env.JWT_ACCESS_SECRET});
        return userData;
    } catch(e) {
        return null;
    } 
}

private async saveToken(id, refreshToken) {
    const tokenData = await this.tokenRepo.findOne({
        where: {
          id: id,
        },
    });
    if (tokenData) {
        tokenData.refreshToken = refreshToken;
        await tokenData.save();
        return;
    }

    await this.tokenRepo.create({
        id: id,
        refreshToken: refreshToken
    })
}

async removeToken(refreshToken) {
  return await this.tokenRepo.destroy({
    where: {
      refreshToken: refreshToken,
    },
  });
}

async tokenFromDB(refreshToken) {
    const tokenData = await this.tokenRepo.findOne({where: {refreshToken: refreshToken}});
    return (tokenData) ? tokenData : null;
}

async getUserIdByRefreshToken(refreshToken) {
    if (!refreshToken) {
      throw UnauthorizedException;
    }
    const userData = await this.validateRefreshToken(refreshToken);
    return (userData) ? userData.id : null
  }


  async refresh(refreshToken) {
    if (!refreshToken) {
      throw UnauthorizedException;
    }
    const userId = await this.getUserIdByRefreshToken(refreshToken);
    const tokenFromDb = await this.tokenFromDB(refreshToken);
    if (!userId || !tokenFromDb) {
      throw UnauthorizedException;
    }
  
    const user = await this.userService.getUserById(userId)
    const userDto = new UserDto(user);
    const tokens = await this.generateAndSaveToken({...userDto});
  
    return {accessToken: tokens.accessToken, newRefreshToken: tokens.refreshToken};
    }

}
