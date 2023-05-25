import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RolesService } from '../../roles/roles.service';
import { UsersService } from '../../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import { UserDto } from '../../dtos/user.dto';
import { InitCouple } from '../../classes/init.couple';

@Injectable()
export class InitialService {
  constructor(
    private roleService: RolesService,
    private userService: UsersService,
    private tokenService: TokensService,
  ) {}

  async createAdmin(initCouple: InitCouple) {
    const admin = await this.userService.createUser(initCouple, 'admin');

    const tokenPayload = new UserDto(admin);
    const rootTokens = await this.tokenService.generateAndSaveToken(
      tokenPayload,
    );
    return rootTokens;
  }
  async initial(initCouple: InitCouple) {
    const baseRole = await this.roleService.getRoleByName('user');

    if (baseRole) {
      throw new HttpException(
        `Инициализация уже выполнена`,
        HttpStatus.FORBIDDEN,
      );
    }
    if (
      process.env.ROOT_MAIL === undefined ||
      process.env.ROOT_PASSWORD === undefined
    ) {
      throw new HttpException(
        'Ошибка инициализации, не заданы mail & password в .env',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.roleService.createRole({
      roleName: 'root',
      description: 'Владелец ресурса',
    });
    await this.roleService.createRole({
      roleName: 'admin',
      description: 'Администратор',
    });
    await this.roleService.createRole({
      roleName: 'user',
      description: 'Пользователь ресурса',
    });

    await this.userService.createUser(
      {
        email: process.env.ROOT_MAIL,
        password: process.env.ROOT_PASSWORD,
      },
      'root',
    );
    const adminTokens = await this.createAdmin(initCouple);

    return {
      accessToken: adminTokens.accessToken,
      refreshToken: adminTokens.refreshToken,
    };
  }
}
