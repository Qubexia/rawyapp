import { Test, TestingModule } from '@nestjs/testing';
import { EpisodesController } from '../../src/episodes/episodes.controller';
import { EpisodesService } from '../../src/episodes/episodes.service';
import { PodcastsService } from '../../src/podcasts/podcasts.service';
import { ConfigService } from '@nestjs/config';

describe('EpisodesController - uploadInternal', () => {
  let controller: EpisodesController;
  let service: any;
  let podcastsService: any;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ _id: '123', title: 'Internal Ep', source: 'internal' }),
    };

    podcastsService = {
      isOwner: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EpisodesController],
      providers: [
        { provide: EpisodesService, useValue: service },
        { provide: PodcastsService, useValue: podcastsService },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    controller = module.get<EpisodesController>(EpisodesController);
  });

  it('should successfully upload an internal episode', async () => {
    const dto = { title: 'Internal Ep', description: 'desc', podcastId: 'p123' };
    const mockAudio: Express.Multer.File[] = [{ path: 'uploads/audio/test.mp3' } as any];
    
    const result = await controller.create('user1', 'CREATOR', dto, { audioFile: mockAudio });
    
    expect(result.data.title).toBe('Internal Ep');
    expect(result.data.source).toBe('internal');
    expect(podcastsService.isOwner).toHaveBeenCalledWith('p123', expect.anything());
    expect(service.create).toHaveBeenCalled();
  });
});
