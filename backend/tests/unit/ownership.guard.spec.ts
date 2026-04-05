import { OwnershipGuard } from '../../src/common/guards/ownership.guard';
import { ExecutionContext } from '@nestjs/common';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;
  let podcastModel: any;

  beforeEach(() => {
    podcastModel = {
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
    } as any;
    guard = new OwnershipGuard(podcastModel);
  });

  it('should define the guard', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if user is Admin', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'ADMIN' },
          params: {},
          body: {},
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should pass through if no resourceId is present', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'CREATOR', id: '123' },
          params: {},
          body: {},
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});
