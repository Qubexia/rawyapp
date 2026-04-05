import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from '../../src/sync/services/sync.service';
import { RssParserService } from '../../src/sync/services/rss-parser.service';
import { DeduplicationService } from '../../src/sync/services/deduplication.service';
import { getModelToken } from '@nestjs/mongoose';
import { Podcast } from '../../src/podcasts/schemas/podcast.schema';
import { Episode } from '../../src/episodes/schemas/episode.schema';

describe('SyncService', () => {
  let service: SyncService;
  let podcastModel: any;
  let episodeModel: any;
  let rssParserService: any;
  let deduplicationService: any;

  beforeEach(async () => {
    podcastModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };
    
    episodeModel = {
      bulkWrite: jest.fn().mockResolvedValue({ nUpserted: 1 }),
      countDocuments: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(1),
    };

    rssParserService = {
      parseFeed: jest.fn().mockResolvedValue({
        items: [{ title: 'Test Episode', guid: 'hash123', enclosure: { url: 'http://test.com/audio.mp3' } }]
      }),
    };

    deduplicationService = {
      filterNewEpisodes: jest.fn().mockResolvedValue([
        { title: 'Test Episode', guid: 'hash123', enclosure: { url: 'http://test.com/audio.mp3' } }
      ])
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: getModelToken(Podcast.name), useValue: podcastModel },
        { provide: getModelToken(Episode.name), useValue: episodeModel },
        { provide: RssParserService, useValue: rssParserService },
        { provide: DeduplicationService, useValue: deduplicationService },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
  });

  describe('syncPodcast', () => {
    it('should parse feed, deduplicate, and bulk write', async () => {
      const mockPodcast = {
        _id: '123',
        title: 'Tech Talk',
        feedUrl: 'http://example.com/rss',
        save: jest.fn()
      } as any;

      await service.syncPodcast(mockPodcast);

      expect(rssParserService.parseFeed).toHaveBeenCalledWith('http://example.com/rss');
      expect(deduplicationService.filterNewEpisodes).toHaveBeenCalled();
      expect(episodeModel.bulkWrite).toHaveBeenCalled();
      expect(mockPodcast.save).toHaveBeenCalled();
    });
    
    it('should not bulk write if no new items found', async () => {
      deduplicationService.filterNewEpisodes.mockResolvedValueOnce([]);
      
      const mockPodcast = {
        _id: '123',
        title: 'Tech Talk',
        feedUrl: 'http://example.com/rss',
      } as any;

      await service.syncPodcast(mockPodcast);

      expect(episodeModel.bulkWrite).not.toHaveBeenCalled();
    });
  });
});
