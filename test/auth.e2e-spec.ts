import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as cookieParser from 'cookie-parser';

describe('Authentication System (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  const testUser = {
    email: 'test2@email.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  }, 30000); // Increase timeout to 30 seconds

  it('should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    // Accept both 201 (new user) and 409 (user exists)
    expect([201, 409]).toContain(response.status);
    if (response.status === 201) {
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toEqual(testUser.email);
    }
  }, 10000);

  it('should login user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toEqual(testUser.email);

    accessToken = response.body.accessToken;
  }, 10000);

  it('should get user profile with valid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
  }, 10000);

  it('should fail to get profile without token', async () => {
    const response = await request(app.getHttpServer()).get('/auth/profile');

    expect(response.status).toBe(401);
  }, 10000);

  it('should refresh token', async () => {
    // First login to get refresh token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    const refreshToken = loginResponse.body.refreshToken;

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  }, 10000);

  afterAll(async () => {
    await app.close();
  });
});
