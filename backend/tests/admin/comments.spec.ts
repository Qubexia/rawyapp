import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';

describe('Admin Comments Controller', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const mockAdminService = {
      listComments: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      getCommentById: jest.fn().mockResolvedValue({ _id: '1', text: 'Great episode!' }),
      removeComment: jest.fn().mockResolvedValue(undefined),
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

  it('should list comments', async () => {
    await controller.listComments({ page: 1, limit: 10 });
    expect(service.listComments).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('should get comment details', async () => {
    await controller.getComment('1');
    expect(service.getCommentById).toHaveBeenCalledWith('1');
  });

  it('should delete comment', async () => {
    await controller.removeComment('1');
    expect(service.removeComment).toHaveBeenCalledWith('1');
  });
});
