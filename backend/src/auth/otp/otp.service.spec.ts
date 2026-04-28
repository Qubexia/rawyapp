import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OtpService } from './otp.service';
import { Otp, OtpPurpose } from './entities/otp.entity';
import { EmailService } from './email.service';
import { OtpConfigService } from '../../config/otp.config';
import * as bcrypt from 'bcrypt';

describe('OtpService', () => {
  let service: OtpService;
  let model: any;
  let emailService: any;

  const mockOtpModel = {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockEmailService = {
    sendOtpEmail: jest.fn(),
  };

  const mockOtpConfigService = {
    expirySeconds: 600,
    maxAttempts: 5,
    cooldownSeconds: 60,
    otpLength: 6,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: getModelToken(Otp.name),
          useValue: mockOtpModel,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: OtpConfigService,
          useValue: mockOtpConfigService,
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    model = module.get(getModelToken(Otp.name));
    emailService = module.get(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOtp', () => {
    it('should generate, hash and save OTP', async () => {
      const email = 'test@example.com';
      const purpose = OtpPurpose.VERIFY_EMAIL;

      model.findOneAndUpdate.mockResolvedValue({});

      const otp = await service.generateOtp(email, purpose);

      expect(otp).toHaveLength(6);
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { email, purpose },
        expect.objectContaining({
          email,
          purpose,
          otp: expect.any(String),
          expiresAt: expect.any(Date),
          attempts: 0,
        }),
        { upsert: true, new: true },
      );
      expect(emailService.sendOtpEmail).toHaveBeenCalledWith(
        email,
        otp,
        purpose,
      );
    });
  });

  describe('verifyOtp', () => {
    it('should return true for valid OTP', async () => {
      const email = 'test@example.com';
      const rawOtp = '123456';
      const hashedOtp = await bcrypt.hash(rawOtp, 10);
      const purpose = OtpPurpose.VERIFY_EMAIL;

      model.findOne.mockResolvedValue({
        email,
        otp: hashedOtp,
        purpose,
        expiresAt: new Date(Date.now() + 10000),
        attempts: 0,
        save: jest.fn(),
      });

      const result = await service.verifyOtp(email, rawOtp, purpose);

      expect(result).toBe(true);
      expect(model.deleteOne).toHaveBeenCalled();
    });

    it('should throw error for expired OTP', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const purpose = OtpPurpose.VERIFY_EMAIL;

      model.findOne.mockResolvedValue({
        email,
        otp: 'hashed',
        purpose,
        expiresAt: new Date(Date.now() - 10000),
        attempts: 0,
      });

      await expect(service.verifyOtp(email, otp, purpose)).rejects.toThrow(
        'OTP expired',
      );
    });

    it('should increment attempts and throw error for invalid OTP', async () => {
      const email = 'test@example.com';
      const rawOtp = '123456';
      const purpose = OtpPurpose.VERIFY_EMAIL;
      const mockOtpDoc = {
        email,
        otp: await bcrypt.hash('wrong', 10),
        purpose,
        expiresAt: new Date(Date.now() + 10000),
        attempts: 0,
        save: jest.fn(),
      };

      model.findOne.mockResolvedValue(mockOtpDoc);

      await expect(service.verifyOtp(email, rawOtp, purpose)).rejects.toThrow(
        'Invalid OTP',
      );
      expect(mockOtpDoc.attempts).toBe(1);
      expect(mockOtpDoc.save).toHaveBeenCalled();
    });
  });
});
