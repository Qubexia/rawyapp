import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { EpisodesService } from '../../src/episodes/episodes.service';
import { Episode } from '../../src/episodes/schemas/episode.schema';

// We need to mock all forwardRef dependencies that EpisodesService requires
jest.mock('../../src/notifications/notifications.service', () => ({
  NotificationsService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../src/podcasts/podcasts.service', () => ({
  PodcastsService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../src/likes/likes.service', () => ({
  LikesService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../src/comments/comments.service', () => ({
  CommentsService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../src/views/views.service', () => ({
  ViewsService: jest.fn().mockImplementation(() => ({})),
}));

describe('EpisodesService', () => {
  let service: EpisodesService;
  let episodeModel: any;

  beforeEach(async () => {
    episodeModel = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
      exec: jest.fn(),
    };

    const { NotificationsService } = require('../../src/notifications/notifications.service');
    const { PodcastsService } = require('../../src/podcasts/podcasts.service');
    const { LikesService } = require('../../src/likes/likes.service');
    const { CommentsService } = require('../../src/comments/comments.service');
    const { ViewsService } = require('../../src/views/views.service');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EpisodesService,
        { provide: getModelToken(Episode.name), useValue: episodeModel },
        { provide: NotificationsService, useValue: {} },
        { provide: PodcastsService, useValue: {} },
        { provide: LikesService, useValue: {} },
        { provide: CommentsService, useValue: {} },
        { provide: ViewsService, useValue: {} },
      ],
    }).compile();

    service = module.get<EpisodesService>(EpisodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated episodes for a specific podcast', async () => {
      const mockPodcastId = new Types.ObjectId().toString();
      const mockEpisodes = [
        { _id: new Types.ObjectId(), title: 'Ep 1', podcastId: mockPodcastId, creatorId: new Types.ObjectId() },
      ];

      episodeModel.exec.mockResolvedValueOnce(mockEpisodes);
      (episodeModel.countDocuments as jest.Mock).mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(1) });
        
      const result = await service.findAll(1, 20, mockPodcastId);

      expect(episodeModel.find).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
