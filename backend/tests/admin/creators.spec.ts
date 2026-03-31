import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';

describe('Admin Creators Controller', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const mockAdminService = {
      listCreators: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      getCreatorById: jest.fn().mockResolvedValue({ _id: '1', showName: 'Creator 1' }),
      updateCreator: jest.fn().mockResolvedValue({ _id: '1', showName: 'Updated' }),
      removeCreatorStatus: jest.fn().mockResolvedValue(undefined),
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

  it('should list creators', async () => {
    await controller.listCreators({ page: 1, limit: 10 });
    expect(service.listCreators).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('should get creator details', async () => {
    await controller.getCreator('1');
    expect(service.getCreatorById).toHaveBeenCalledWith('1');
  });

  it('should update creator', async () => {
    await controller.updateCreator('1', { showName: 'Updated' });
    expect(service.updateCreator).toHaveBeenCalledWith('1', { showName: 'Updated' });
  });

  it('should remove creator status', async () => {
    await controller.removeCreatorStatus('1');
    expect(service.removeCreatorStatus).toHaveBeenCalledWith('1');
  });
});
