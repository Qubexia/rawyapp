import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TokenResponseDto } from './dto/token-response.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: any;

  const mockAuthService = {
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('forgotPassword', () => {
    it('should call forgotPassword and return message', async () => {
      const dto: ForgotPasswordDto = { email: 'test@example.com' };
      service.forgotPassword.mockResolvedValue(undefined);

      const result = await controller.forgotPassword(dto);

      expect(service.forgotPassword).toHaveBeenCalledWith(dto);
      expect(result.message).toContain('reset code has been sent');
    });
  });

  describe('resetPassword', () => {
    it('should call resetPassword and return tokens', async () => {
      const dto: ResetPasswordDto = {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'NewPassword123!',
      };
      const mockResult: TokenResponseDto = {
        accessToken: 'access',
        refreshToken: 'refresh',
        user: { email: dto.email } as any,
      };
      service.resetPassword.mockResolvedValue(mockResult);

      const result = await controller.resetPassword(dto);

      expect(service.resetPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('changePassword', () => {
    it('should call changePassword and return tokens', async () => {
      const userId = 'user-123';
      const dto: ChangePasswordDto = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };
      const mockResult: TokenResponseDto = {
        accessToken: 'access',
        refreshToken: 'refresh',
        user: { id: userId } as any,
      };
      service.changePassword.mockResolvedValue(mockResult);

      const result = await controller.changePassword(userId, dto);

      expect(service.changePassword).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(mockResult);
    });
  });
});
