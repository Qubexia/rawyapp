import { Test, TestingModule } from '@nestjs/testing';
import { PodcastsController } from '../../src/podcasts/podcasts.controller';
import { PodcastsService } from '../../src/podcasts/podcasts.service';
import { AppleApiService } from '../../src/podcasts/services/apple-api.service';
import { UsersService } from '../../src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { SyncService } from '../../src/sync/services/sync.service';
import { Types } from 'mongoose';

describe('PodcastsController - createInternal', () => {
  let controller: PodcastsController;
  let service: any;
  const userId = new Types.ObjectId().toString();

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ _id: '123', title: 'Internal Podcast', source: 'internal' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PodcastsController],
      providers: [
        { provide: PodcastsService, useValue: service },
        { provide: AppleApiService, useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: SyncService, useValue: {} },
      ],
    }).compile();

    controller = module.get<PodcastsController>(PodcastsController);
  });

  it('should successfully create an internal podcast', async () => {
    const dto = { title: 'Internal Podcast', description: 'A great podcast description' };
    const result = await controller.create(userId, 'CREATOR', dto);
    
    expect(result.data.title).toBe('Internal Podcast');
    expect(result.data.source).toBe('internal');
    expect(service.create).toHaveBeenCalled();
  });
});
