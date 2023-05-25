import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';
import { PoolClient } from 'pg';
import { dataPool } from './dbPools/dataDb';
import { accessPool } from './dbPools/accessDb';

describe('Init e2e', () => {
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
  });

  it('Пытаемся регистрировать пользователя до инициализации сервера - ошибка 424', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({ email: 'user@mail.ru', password: '123321' })
      .expect(424);
  });

  it('Инициализируем ресурс /api/init. Успех', async () => {
    const res = await request(app.getHttpServer())
      .post('/init')
      .send({ email: 'admin@admin.com', password: 'IamAdmin' })
      .expect(201);

    const users = (await accessPoolClient.query('SELECT * from users')).rows;
    const roles = (await accessPoolClient.query('SELECT * from roles')).rows;
    const usersRoles = (
      await accessPoolClient.query('SELECT * from user_roles')
    ).rows;
    expect(users).toHaveLength(2);
    expect(roles).toHaveLength(3);
    expect(usersRoles).toHaveLength(2);
    return res;
  });

  afterAll(async () => {
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
