import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';

describe('Admin Podcasts Controller', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const mockAdminService = {
      listPodcasts: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      getPodcastById: jest.fn().mockResolvedValue({ _id: '1', title: 'Podcast 1' }),
      updatePodcast: jest.fn().mockResolvedValue({ _id: '1', title: 'Updated' }),
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

  it('should update podcast', async () => {
    await controller.updatePodcast('1', { title: 'Updated' });
    expect(service.updatePodcast).toHaveBeenCalledWith('1', { title: 'Updated' });
  });

  it('should delete podcast', async () => {
    await controller.removePodcast('1');
    expect(service.removePodcast).toHaveBeenCalledWith('1');
  });
});
