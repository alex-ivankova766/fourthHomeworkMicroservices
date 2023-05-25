import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Role } from '../roles/roles.model';
import { RolesService } from '../roles/roles.service';

const roleRepositoryMock = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
  update: jest.fn(),
};

async function getRolesService(roleRepository: any = roleRepositoryMock) {
  const module = await Test.createTestingModule({
    providers: [
      RolesService,
      {
        provide: getModelToken(Role),
        useValue: roleRepository,
      },
    ],
  }).compile();

  return module.get<RolesService>(RolesService);
}
describe('RolesService', () => {
  describe('createRole', () => {
    it('Метод существует', async () => {
      const rolesService = await getRolesService();
      expect(rolesService).toHaveProperty('createRole');
    });

    it('Проверяем созданную роль', async () => {
      const roleRepository = {
        findOne: jest.fn().mockReturnValue(null),
        create: jest.fn().mockReturnValue({
          id: 1,
          roleName: 'admin',
          description: 'Администратор ресурса',
        }),
      };

      const rolesService = await getRolesService(roleRepository);

      const roleData = {
        roleName: 'admin',
        description: 'Администратор ресурса',
      };
      const createdRole = await rolesService.createRole(roleData);

      expect(createdRole.roleName).toEqual(roleData.roleName);
      expect(createdRole.description).toEqual(roleData.description);
      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { roleName: roleData.roleName },
      });
      expect(roleRepository.create).toHaveBeenCalledWith(roleData);
    });
  });
});

describe('RolesService', () => {
  describe('getAllRoles', () => {
    it('Метод существует', async () => {
      const rolesService = await getRolesService();
      expect(rolesService).toHaveProperty('getAllRoles');
    });

    it('Получение всех ролей', async () => {
      const roleRepository = {
        findAll: jest.fn().mockReturnValue([
          { id: 1, roleName: 'Admin' },
          { id: 2, roleName: 'User' },
        ]),
      };

      const rolesService = await getRolesService(roleRepository);

      const roles = await rolesService.getAllRoles();

      expect(roles).toEqual([
        { id: 1, roleName: 'Admin' },
        { id: 2, roleName: 'User' },
      ]);
      expect(roleRepository.findAll).toHaveBeenCalledWith({
        include: { all: true },
      });
    });
  });

  describe('updateByName', () => {
    it('Метод существует', async () => {
      const rolesService = await getRolesService();
      expect(rolesService).toHaveProperty('updateByName');
    });

    it('Обновление роли по имени', async () => {
      const roleName = 'admin';
      const dto = { description: 'Обновлённое описание роли админа' };

      const roleRepository = {
        findOne: jest.fn().mockReturnValue({
          id: 1,
          roleName: 'admin',
          description: 'Былое описание роли админа',
          update: jest.fn().mockImplementation(function (dto) {
            this.description = dto.description;
          }),
        }),
      };

      const rolesService = await getRolesService(roleRepository);

      const updatedRole = await rolesService.updateByName(roleName, dto);

      expect(updatedRole).toMatchObject({
        id: 1,
        roleName: 'admin',
        description: 'Обновлённое описание роли админа',
      });
      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { roleName },
      });
      expect(roleRepository.findOne().update).toHaveBeenCalledWith(dto);
    });

    it('Ошибка при отсутствии обновляемой роли', async () => {
      const roleName = 'Несуществующая роль';
      const dto = { description: 'Обновлённое описание роли' };

      const roleRepository = {
        findOne: jest.fn().mockReturnValue(null),
      };

      const rolesService = await getRolesService(roleRepository);

      await expect(
        rolesService.updateByName(roleName, dto),
      ).rejects.toThrowError(
        new HttpException(
          'Роли с таким именем не существует',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { roleName },
      });
    });
  });

  describe('deleteByName', () => {
    it('Метод существует', async () => {
      const rolesService = await getRolesService();
      expect(rolesService).toHaveProperty('deleteByName');
    });

    it('Удаление роли по имени', async () => {
      const roleName = 'user';

      const roleRepository = {
        findOne: jest
          .fn()
          .mockReturnValue({ destroy: jest.fn().mockReturnValue(true) }),
      };

      const rolesService = await getRolesService(roleRepository);

      const result = await rolesService.deleteByName(roleName);

      expect(result).toEqual(true);
      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { roleName },
      });
      expect(roleRepository.findOne().destroy).toHaveBeenCalled();
    });

    it('Ошибка при отсутствии роли', async () => {
      const roleName = 'Несуществующая роль';

      const roleRepository = {
        findOne: jest.fn().mockReturnValue(null),
      };

      const rolesService = await getRolesService(roleRepository);

      await expect(rolesService.deleteByName(roleName)).rejects.toThrowError(
        new HttpException(
          'Роли с таким именем не существует',
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { roleName },
      });
    });
  });
});
