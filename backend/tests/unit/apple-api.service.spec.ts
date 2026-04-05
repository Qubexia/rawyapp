import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AppleApiService } from '../../src/podcasts/services/apple-api.service';
import { of } from 'rxjs';

describe('AppleApiService', () => {
  let service: AppleApiService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    httpService = {
      get: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppleApiService,
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();

    service = module.get<AppleApiService>(AppleApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchTopPodcasts', () => {
    it('should fetch and map top podcasts from Apple API', async () => {
      // Mock Top Podcasts response
      const mockRssResponse = {
        data: {
          feed: {
            entry: [
              {
                id: { attributes: { 'im:id': '123' } },
                title: { label: 'Test Podcast' },
                summary: { label: 'Test Description' },
                'im:image': [{ label: 'test-image.jpg' }],
                'im:artist': { label: 'Test Author' },
              },
            ],
          },
        },
      };

      // Mock Lookup response
      const mockLookupResponse = {
        data: {
          results: [
            { trackId: 123, feedUrl: 'https://test.com/feed.xml' },
          ],
        },
      };

      httpService.get
        .mockReturnValueOnce(of(mockRssResponse as any))
        .mockReturnValueOnce(of(mockLookupResponse as any));

      const result = await service.fetchTopPodcasts();

      expect(httpService.get).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '123',
        title: 'Test Podcast',
        description: 'Test Description',
        feedUrl: 'https://test.com/feed.xml',
        artworkUrl: 'test-image.jpg',
        author: 'Test Author',
        appleId: '123',
      });
    });

    it('should return empty array if no entries found', async () => {
      httpService.get.mockReturnValueOnce(of({ data: { feed: { entry: [] } } } as any));

      const result = await service.fetchTopPodcasts();

      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(0);
    });
  });
});
