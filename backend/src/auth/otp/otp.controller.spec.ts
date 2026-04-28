import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { OtpPurpose } from './entities/otp.entity';
import { UsersService } from '../../users/users.service';

describe('OtpController', () => {
  let controller: OtpController;
  let service: any;
  let usersService: any;

  const mockOtpService = {
    generateOtp: jest.fn(),
    verifyOtp: jest.fn(),
    sendConfirmationEmail: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    verifyEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<OtpController>(OtpController);
    service = module.get(OtpService);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendOtp', () => {
    it('should call generateOtp and return success message', async () => {
      const dto = { email: 'test@example.com', purpose: OtpPurpose.VERIFY_EMAIL };
      usersService.findByEmail.mockResolvedValue({ isEmailVerified: false });
      service.generateOtp.mockResolvedValue('123456');

      const result = await controller.sendOtp(dto);

      expect(service.generateOtp).toHaveBeenCalledWith(dto.email, dto.purpose);
      expect(result.message).toContain(dto.email);
    });
  });

  describe('verifyOtp', () => {
    it('should call verifyOtp and return success message', async () => {
      const dto = {
        email: 'test@example.com',
        otp: '123456',
        purpose: OtpPurpose.VERIFY_EMAIL,
      };
      service.verifyOtp.mockResolvedValue(true);

      const result = await controller.verifyOtp(dto);

      expect(service.verifyOtp).toHaveBeenCalledWith(
        dto.email,
        dto.otp,
        dto.purpose,
      );
      expect(result.message).toBe('OTP verified successfully');
    });
  });

  describe('resendOtp', () => {
    it('should call generateOtp and return success message', async () => {
      const dto = { email: 'test@example.com', purpose: OtpPurpose.VERIFY_EMAIL };
      usersService.findByEmail.mockResolvedValue({ isEmailVerified: false });
      service.generateOtp.mockResolvedValue('123456');

      const result = await controller.resendOtp(dto);

      expect(service.generateOtp).toHaveBeenCalledWith(dto.email, dto.purpose);
      expect(result.message).toContain(dto.email);
    });
  });
});
