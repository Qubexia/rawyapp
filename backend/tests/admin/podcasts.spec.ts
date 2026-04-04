import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';

describe('Admin Podcasts Controller', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockPublishedPodcast = {
    _id: '1',
    title: 'Published Podcast',
    description: 'A published podcast description for testing',
    category: 'Technology',
    status: 'published',
    coverImageUrl: 'uploads/images/old-cover.jpg',
    creator: { _id: 'creator1', name: 'Creator' },
    episodeCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const mockAdminService = {
      listPodcasts: jest.fn().mockResolvedValue({ data: [mockPublishedPodcast], total: 1 }),
      getPodcastById: jest.fn().mockResolvedValue(mockPublishedPodcast),
      updatePodcast: jest.fn().mockImplementation((id, dto, coverImageUrl) => {
        return Promise.resolve({
          ...mockPublishedPodcast,
          ...dto,
          ...(coverImageUrl ? { coverImageUrl } : {}),
        });
      }),
      removePodcast: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should list podcasts', async () => {
    await controller.listPodcasts({ page: 1, limit: 10 });
    expect(service.listPodcasts).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('should get podcast details', async () => {
    await controller.getPodcast('1');
    expect(service.getPodcastById).toHaveBeenCalledWith('1');
  });

  // T009: admin edits published podcast title/description
  it('should update published podcast title and description', async () => {
    const updateDto = {
      title: 'Updated Published Title',
      description: 'Updated description for a published podcast which should work fine',
    };

    const result = await controller.updatePodcast('1', updateDto, {});

    expect(service.updatePodcast).toHaveBeenCalledWith('1', updateDto, undefined);
    expect(result.statusCode).toBe(200);
    expect(result.data.title).toBe('Updated Published Title');
    expect(result.data.description).toBe('Updated description for a published podcast which should work fine');
  });

  // T010: admin edits published podcast cover image
  it('should update published podcast cover image via file upload', async () => {
    const mockFile = {
      fieldname: 'imageFile',
      originalname: 'new-cover.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      path: './uploads/images/uuid-new-cover.jpg',
      size: 1024,
    } as Express.Multer.File;

    const result = await controller.updatePodcast(
      '1',
      {},
      { imageFile: [mockFile] },
    );

    expect(service.updatePodcast).toHaveBeenCalledWith(
      '1',
      {},
      'uploads/images/uuid-new-cover.jpg',
    );
    expect(result.statusCode).toBe(200);
    expect(result.data.coverImageUrl).toBe('uploads/images/uuid-new-cover.jpg');
  });

  // T011: admin edits published podcast category
  it('should update published podcast category', async () => {
    const updateDto = { category: 'Science' };

    const result = await controller.updatePodcast('1', updateDto as any, {});

    expect(service.updatePodcast).toHaveBeenCalledWith('1', updateDto, undefined);
    expect(result.statusCode).toBe(200);
    expect(result.data.category).toBe('Science');
  });

  // T012: verify podcast remains published after edit
  it('should preserve published status after editing podcast fields', async () => {
    const updateDto = {
      title: 'Edited Title That Stays Published',
    };

    const result = await controller.updatePodcast('1', updateDto, {});

    expect(result.statusCode).toBe(200);
    // The update mock merges dto into the published podcast — status must remain 'published'
    expect(result.data.status).toBe('published');
    // Specifically verify that status was never set to 'draft' in the dto
    expect(updateDto).not.toHaveProperty('status');
  });

  it('should delete podcast', async () => {
    await controller.removePodcast('1');
    expect(service.removePodcast).toHaveBeenCalledWith('1');
  });
});
