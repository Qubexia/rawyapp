import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';

describe('Admin Episodes Controller', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const mockAdminService = {
      listEpisodes: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      getEpisodeById: jest.fn().mockResolvedValue({ _id: '1', title: 'Episode 1' }),
      updateEpisode: jest.fn().mockResolvedValue({ _id: '1', title: 'Updated' }),
      removeEpisode: jest.fn().mockResolvedValue(undefined),
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

  it('should list episodes', async () => {
    await controller.listEpisodes({ page: 1, limit: 10 });
    expect(service.listEpisodes).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('should get episode details', async () => {
    await controller.getEpisode('1');
    expect(service.getEpisodeById).toHaveBeenCalledWith('1');
  });

  it('should update episode', async () => {
    await controller.updateEpisode('1', { title: 'Updated' });
    expect(service.updateEpisode).toHaveBeenCalledWith('1', { title: 'Updated' });
  });

  it('should delete episode', async () => {
    await controller.removeEpisode('1');
    expect(service.removeEpisode).toHaveBeenCalledWith('1');
  });
});
