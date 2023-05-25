import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcryptjs';
import * as uuid from 'uuid';
import { mailService } from './mail-service/mail.service';
import { ChangePassCouple } from '../classes/change-pass.couple';
import { LoginUserDto } from '../classes/login-user';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private readonly roleService: RolesService,
  ) {}

  async createUser(
    createUserCouple: Partial<LoginUserDto>,
    userRole = 'user',
  ): Promise<User> {
    const role = await this.roleService.getRoleByName(userRole);

    if (
      userRole === 'root' &&
      createUserCouple.email !== process.env.ROOT_MAIL &&
      createUserCouple.password !== process.env.ROOT_PASSWORD
    ) {
      throw new HttpException('Недостаточно прав', HttpStatus.FORBIDDEN);
    }
    if (!role) {
      throw new HttpException(
        'Роль не найдена, необходимо выполнение инициализации ресурса',
        HttpStatus.FAILED_DEPENDENCY,
      );
    }

    const candidate = await this.getUserByEmail(createUserCouple.email);

    if (candidate) {
      throw new HttpException(
        'Пользователь уже существует',
        HttpStatus.CONFLICT,
      );
    }

    const hashPassword = createUserCouple.password
      ? await bcrypt.hash(createUserCouple.password, +process.env.SALT)
      : null;
    const activationLink = uuid.v4();

    const user = await this.userRepository.create({
      vk_id: createUserCouple.vk_id ? createUserCouple.vk_id : null,
      email: createUserCouple.email,
      password: hashPassword,
      activationLink: activationLink,
    });

    await user.$set('roles', [role]);
    await user.update({ roles: [role] });

    try {
      await mailService.sendActivationMail(
        createUserCouple.email,
        `${process.env.API_URL}/api/users/activate/${activationLink}`,
      );
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Ошибка при отправке активационной ссылки',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return user;
  }

  async activate(activationLink: string) {
    const user = await this.userRepository.findOne({
      where: { activationLink: activationLink },
    });
    if (!user) {
      throw new HttpException(
        'Ссылка активации не верна',
        HttpStatus.BAD_REQUEST,
      );
    }
    await user.update({ isActivated: true });
    return user;
  }

  private async validateUser(couple: LoginUserDto) {
    const user = await this.getUserByEmail(couple.email);
    let passwordEquals;
    if (user) {
      passwordEquals = await bcrypt.compare(couple.password, user.password);
    }

    if (passwordEquals) {
      return user;
    } else {
      throw new HttpException(
        'Неверный емейл или пароль',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getAllUsers() {
    return await this.userRepository.findAll({ include: { all: true } });
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email },
      include: { all: true },
    });
    return user ? user : null;
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      include: { all: true },
    });
    return user ? user : null;
  }

  async getUserByVkId(id: number) {
    const user = await this.userRepository.findOne({
      where: { vk_id: id },
      include: { all: true },
    });
    return user;
  }

  async updateUserEmail(email: string, newEmail: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'Пользователь не существует',
        HttpStatus.NOT_FOUND,
      );
    }
    await user.update({ email: newEmail });
    return user;
  }

  async updateUserPassword(id: number, changePassCouple: ChangePassCouple) {
    const user = await this.getUserById(id);
    const isRightDatas = await this.validateUser({
      email: user.email,
      password: changePassCouple.oldPassword,
    });
    if (!isRightDatas) {
      throw new HttpException('Данные не верны', HttpStatus.FORBIDDEN);
    }
    const newPassword = await bcrypt.hash(
      changePassCouple.newPassword,
      +process.env.SALT,
    );
    return await user.update({ password: newPassword });
  }

  async deleteUserById(id: number) {
    const user = await this.getUserById(id);

    if (!user) {
      throw new HttpException(
        'Пользователь не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    await user.destroy();
    return true;
  }

  async addRole(roleName: string, id: number) {
    const role = await this.roleService.getRoleByName(roleName);
    const user = await this.getUserById(id);

    if (role && user) {
      await user.$add('roles', role);
      return user;
    }

    throw new HttpException(
      'Пользователь или роль не существует',
      HttpStatus.NOT_FOUND,
    );
  }

  async addRoleByEmail(roleName: string, email: string) {
    const role = await this.roleService.getRoleByName(roleName);
    const user = await this.getUserByEmail(email);

    if (role && user) {
      await user.$add('roles', role);
      return user;
    }

    throw new HttpException(
      'Пользователь или роль не существует',
      HttpStatus.NOT_FOUND,
    );
  }
}
