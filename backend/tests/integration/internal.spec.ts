import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../../src/app.module';

describe('Internal Podcast Hosting (Integration)', () => {
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

  it('/podcasts (POST) - should require authentication', () => {
    return request(app.getHttpServer())
      .post('/podcasts')
      .send({ title: 'Internal', description: 'Internal desc' })
      .expect(401);
  });
  
  it('/episodes (POST) - should require authentication', () => {
    return request(app.getHttpServer())
      .post('/episodes')
      .expect(401);
  });
});
