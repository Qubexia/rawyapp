import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';

describe('Admin Users Controller', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const mockAdminService = {
      listUsers: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      getUserById: jest.fn().mockResolvedValue({ _id: '1', name: 'User 1' }),
      updateUser: jest.fn().mockResolvedValue({ _id: '1', name: 'Updated User' }),
      deleteUser: jest.fn().mockResolvedValue(true),
      deactivateUser: jest.fn().mockResolvedValue({ _id: '1', isActive: false }),
      activateUser: jest.fn().mockResolvedValue({ _id: '1', isActive: true }),
      promoteUser: jest.fn().mockResolvedValue({ _id: '1', role: 'CREATOR' }),
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

  it('should list users', async () => {
    await controller.listUsers({ page: 1, limit: 10 });
    expect(service.listUsers).toHaveBeenCalled();
  });

  it('should get user by id', async () => {
    await controller.getUser('1');
    expect(service.getUserById).toHaveBeenCalledWith('1');
  });

  it('should update user', async () => {
    await controller.updateUser('1', { name: 'Updated' });
    expect(service.updateUser).toHaveBeenCalledWith('1', { name: 'Updated' });
  });

  it('should delete user', async () => {
    await controller.deleteUser('1');
    expect(service.deleteUser).toHaveBeenCalledWith('1');
  });

  it('should promote user', async () => {
    await controller.promoteUser('1', { role: 'CREATOR' as any });
    expect(service.promoteUser).toHaveBeenCalledWith('1', 'CREATOR');
  });
});
