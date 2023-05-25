import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';
import { PoolClient } from 'pg';
import { dataPool } from './dbPools/dataDb';
import { accessPool } from './dbPools/accessDb';

describe('Access e2e', () => {
  let app: INestApplication;
  let accessPoolClient: PoolClient;
  let dataPoolClient: PoolClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    accessPoolClient = await accessPool.connect();
    dataPoolClient = await dataPool.connect();

    await request(app.getHttpServer())
      .post('/init')
      .send({ email: 'radadabro@gmail.com', password: 'IamAdmin' })
      .expect(201);
  });

  describe('User registration', () => {
    it('Пытаемся регистрировать пользователя с неверным email - ошибка', async () => {
      return await request(app.getHttpServer())
        .post('/auth/registration')
        .send({ email: 'usermail.ru', password: '123321' })
        .expect(400);
    });

    it('Пытаемся регистрировать пользователя с коротким паролем - ошибка', async () => {
      return await request(app.getHttpServer())
        .post('/auth/registration')
        .send({ email: 'admin@mail.ru', password: '123' })
        .expect(400);
    });

    it('Регистрируем пользователя', async () => {
      return await request(app.getHttpServer())
        .post('/auth/registration')
        .send({ email: 'user@mail.ru', password: '123456' })
        .expect(201);
    });

    it('Проверяем базу', async () => {
      const users = (await accessPoolClient.query('SELECT * from users')).rows;
      const usersRoles = (
        await accessPoolClient.query('SELECT * from user_roles')
      ).rows;
      const profiles = (await dataPoolClient.query('SELECT * from profiles'))
        .rows;
      expect(users).toHaveLength(3);
      expect(usersRoles).toHaveLength(3);
      expect(profiles).toHaveLength(3);
    });
  });

  afterAll(async () => {
    await accessPoolClient.query('TRUNCATE TABLE user_roles');
    await accessPoolClient.query(
      'TRUNCATE TABLE users RESTART IDENTITY CASCADE',
    );
    await accessPoolClient.query(
      'TRUNCATE TABLE roles RESTART IDENTITY CASCADE',
    );
    await accessPoolClient.query(
      'TRUNCATE TABLE tokens RESTART IDENTITY CASCADE',
    );
    await dataPoolClient.query(
      'TRUNCATE TABLE profiles RESTART IDENTITY CASCADE',
    );

    accessPoolClient.release(true);
    dataPoolClient.release(true);
    await accessPool.end();
    await dataPool.end();

    await app.close();
  }, 6000);
});
