import { Test, TestingModule } from '@nestjs/testing';
import { DeduplicationService } from '../../src/sync/services/deduplication.service';
import { getModelToken } from '@nestjs/mongoose';
import { Episode } from '../../src/episodes/schemas/episode.schema';
import { Types } from 'mongoose';

describe('DeduplicationService', () => {
  let service: DeduplicationService;
  let episodeModel: any;

  const validPodcastId = new Types.ObjectId().toString();

  beforeEach(async () => {
    episodeModel = {
      find: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeduplicationService,
        { provide: getModelToken(Episode.name), useValue: episodeModel },
      ],
    }).compile();

    service = module.get<DeduplicationService>(DeduplicationService);
  });

  describe('filterNewEpisodes', () => {
    it('should return all items if no episodes exist', async () => {
      episodeModel.exec.mockResolvedValueOnce([]);

      const items = [{ guid: '1' }, { guid: '2' }];
      const result = await service.filterNewEpisodes(validPodcastId, items);

      expect(result).toHaveLength(2);
      expect(result).toEqual(items);
    });

    it('should filter out existing guids', async () => {
      episodeModel.exec.mockResolvedValueOnce([{ guid: '1' }]);

      const items = [{ guid: '1' }, { guid: '2' }];
      const result = await service.filterNewEpisodes(validPodcastId, items);

      expect(result).toHaveLength(1);
      expect(result[0].guid).toBe('2');
    });

    it('should return empty array if items is empty', async () => {
      const result = await service.filterNewEpisodes(validPodcastId, []);
      expect(result).toHaveLength(0);
    });
  });
});
