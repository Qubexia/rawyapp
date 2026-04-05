import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../../src/app.module';

describe('Claim Flow (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/podcasts/claim (POST) - should require authentication', () => {
    return request(app.getHttpServer())
      .post('/podcasts/claim')
      .send({ podcastId: '123' })
      .expect(401);
  });
  
  it('/claims/verify/:token (GET) - should validate format', () => {
    return request(app.getHttpServer())
      .get('/claims/verify/invalid_token')
      .expect(404);
  });
});
