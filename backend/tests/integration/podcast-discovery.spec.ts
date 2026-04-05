import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');


import { AppModule } from '../../src/app.module';

describe('Podcast Discovery (Integration)', () => {
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

  it('/podcasts/discover (GET)', () => {
    return request(app.getHttpServer())
      .get('/podcasts/discover')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBeTruthy();
      });
  });
});
