import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';

describe('Authentication System (e2e)', () => {
  let app: INestApplication;
  let csrfToken: string;
  let cookies: string[];
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
    app.use(csurf({ cookie: true }));
    await app.init();
  }, 30000); // Increase timeout to 30 seconds

  beforeEach(async () => {
    // Get CSRF token
    const response = await request(app.getHttpServer())
      .get('/auth/csrf-token')
      .expect(200);

    csrfToken = response.body.csrfToken;
    cookies = Array.isArray(response.headers['set-cookie'])
      ? response.headers['set-cookie']
      : [];
  }, 10000); // Increase timeout to 10 seconds

  it('should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send(testUser);

    // Accept both 201 (new user) and 409 (user exists)
    expect([201, 409]).toContain(response.status);
    if (response.status === 201) {
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toEqual(testUser.email);
    }
  }, 10000); // Increase timeout to 10 seconds

  it('should login and return JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send(testUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    accessToken = response.body.accessToken;
  }, 10000); // Increase timeout to 10 seconds

  it('should protect profile route with JWT', async () => {
    // Ensure we have a valid token
    if (!accessToken) {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send(testUser);
      accessToken = loginRes.body.accessToken;
    }

    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .expect(200);
  }, 10000); // Increase timeout to 10 seconds

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 10000); // Increase timeout to 10 seconds
});
