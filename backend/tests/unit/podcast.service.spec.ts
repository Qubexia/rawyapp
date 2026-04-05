import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PodcastsService } from '../../src/podcasts/podcasts.service';
import { CreatorsService } from '../../src/creators/creators.service';
import { EpisodesService } from '../../src/episodes/episodes.service';
import { Podcast } from '../../src/podcasts/schemas/podcast.schema';

describe('PodcastsService', () => {
  let service: PodcastsService;
  let findExec: jest.Mock;
  let countExec: jest.Mock;
  let podcastModel: any;

  beforeEach(async () => {
    findExec = jest.fn();
    countExec = jest.fn();

    podcastModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                lean: jest.fn().mockReturnValue({
                  exec: findExec,
                }),
              }),
            }),
          }),
        }),
      }),
      countDocuments: jest.fn().mockReturnValue({ exec: countExec }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PodcastsService,
        { provide: getModelToken(Podcast.name), useValue: podcastModel },
        { provide: CreatorsService, useValue: {} },
        { provide: EpisodesService, useValue: { countByPodcastId: jest.fn().mockResolvedValue(0) } },
      ],
    }).compile();

    service = module.get<PodcastsService>(PodcastsService);
  });

  describe('findAll (getCreatorPodcasts equivalent)', () => {
    it('should return paginated podcasts restricted to creator', async () => {
      const mockCreatorId = new Types.ObjectId().toString();
      const mockPodcasts = [
        { _id: new Types.ObjectId(), title: 'Tech Talk', creatorId: mockCreatorId },
      ];

      findExec.mockResolvedValueOnce(mockPodcasts);
      countExec.mockResolvedValueOnce(1);

      const result = await service.findAll(1, 20, mockCreatorId);

      expect(podcastModel.find).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
