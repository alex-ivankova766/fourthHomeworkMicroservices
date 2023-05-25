import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.model';
import { HttpException, HttpStatus } from '@nestjs/common';

const role9Model = () => ({
  id: 9,
});

const roleServiceMocks = {
  role9: (roleModel: any = role9Model()) => ({
    getRoleByName: jest.fn(() => roleModel),
  }),
  roleNull: () => ({
    getRoleByName: jest.fn(() => null),
  }),
};

const user13Model = () => ({
  $set: jest.fn(),
  $add: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  id: 13,
});

const userRepMocks = {
  user13: (userModel: any = user13Model()) => ({
    create: jest.fn(() => {
      return userModel;
    }),
    findAll: jest.fn(() => [userModel]),
    findOne: jest.fn(() => userModel),
    findByPk: jest.fn(() => userModel),
  }),

  userNull: () => ({
    findOne: jest.fn(() => null),
    findByPk: jest.fn(() => null),
  }),

  userThrow: () => ({
    create: jest.fn(() => {
      throw Error;
    }),
  }),
};

async function getUsersService(
  roleServiceMock: any = roleServiceMocks.role9(),
  userRepMock: any = userRepMocks.user13(),
) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      UsersService,
      {
        provide: RolesService,
        useValue: roleServiceMock,
      },
      {
        provide: getModelToken(User),
        useValue: userRepMock,
      },
    ],
  }).compile();

  const usersService = moduleRef.get<UsersService>(UsersService);
  (usersService as any).roleService = roleServiceMock;
  return usersService;
}

describe('UsersService', () => {
  describe('getAllUsers', () => {
    it('Метод существует', async () => {
      const usersService = await getUsersService();
      expect(usersService).toHaveProperty('getAllUsers');
    });

    it('Метод вызывает findAll', async () => {
      const u13Model = user13Model();
      const user13 = userRepMocks.user13(u13Model);

      const usersService = await getUsersService(undefined, user13);
      expect(await usersService.getAllUsers()).toMatchObject([u13Model]);

      expect(user13.findAll).toHaveBeenCalled();
    });
  });

  describe('getUserByEmail', () => {
    it('Метод существует', async () => {
      const usersService = await getUsersService();
      expect(usersService).toHaveProperty('getUserByEmail');
    });

    it('Метод вызывает findOne', async () => {
      const u13Model = user13Model();
      const user13 = userRepMocks.user13(u13Model);

      const usersService = await getUsersService(undefined, user13);
      expect(await usersService.getUserByEmail('a')).toBe(u13Model);
      expect(user13.findOne).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('Метод существует', async () => {
      const usersService = await getUsersService();
      expect(usersService).toHaveProperty('getUserById');
    });

    it('Метод вызывает findOne', async () => {
      const u13Model = user13Model();
      const user13 = userRepMocks.user13(u13Model);

      const usersService = await getUsersService(undefined, user13);
      expect(await usersService.getUserById(1)).toBe(u13Model);
      expect(user13.findOne).toHaveBeenCalled();
    });
  });

  describe('Delete User by email', () => {
    it('Метод существует', async () => {
      const usersService = await getUsersService();
      expect(usersService).toHaveProperty('deleteUserById');
    });

    it('Успешно удаляет', async () => {
      const u13Model = user13Model();
      const user13 = userRepMocks.user13(u13Model);

      const usersService = await getUsersService(undefined, user13);

      expect(await usersService.deleteUserById(1)).toBe(true);
      expect(user13.findOne).toHaveBeenCalled();
      expect(u13Model.destroy).toHaveBeenCalled();
    });

    it('Если не находит поль-ля, вызывает ошибку', async () => {
      const userNull = userRepMocks.userNull();

      const usersService = await getUsersService(undefined, userNull);

      expect(usersService.deleteUserById(1)).rejects.toThrow(
        new HttpException('Пользователь не существует', HttpStatus.NOT_FOUND),
      );

      expect(userNull.findOne).toHaveBeenCalled();
    });
  });
});
