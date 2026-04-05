import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ClaimsService } from '../../src/claims/claims.service';
import { ClaimRequest } from '../../src/claims/schemas/claim-request.schema';
import { AuthService } from '../../src/auth/auth.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ClaimsService', () => {
  let service: ClaimsService;
  let execMock: jest.Mock;
  let authService: any;

  beforeEach(async () => {
    execMock = jest.fn();

    const mockSave = jest.fn().mockResolvedValue({ _id: new Types.ObjectId() });
    function ModelMock(data: any) {
      this.save = mockSave;
      Object.assign(this, data);
    }
    ModelMock.findOne = jest.fn().mockReturnValue({ exec: execMock });

    authService = {
      upgradeToCreator: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimsService,
        { provide: getModelToken(ClaimRequest.name), useValue: ModelMock },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    service = module.get<ClaimsService>(ClaimsService);
  });

  describe('createRequest', () => {
    it('should create a new claim request if none exists', async () => {
      execMock.mockResolvedValueOnce(null);
      
      const result = await service.createRequest(new Types.ObjectId().toString(), new Types.ObjectId().toString());
      expect(result).toBeDefined();
    });

    it('should update existing request if one exists', async () => {
      const mockExisting = { save: jest.fn().mockResolvedValue({ _id: '123' }) };
      execMock.mockResolvedValueOnce(mockExisting);
      
      const result = await service.createRequest(new Types.ObjectId().toString(), new Types.ObjectId().toString());
      expect(mockExisting.save).toHaveBeenCalled();
    });
  });

  describe('verify', () => {
    it('should throw NotFoundException if token is invalid or expired', async () => {
      execMock.mockResolvedValueOnce(null);
      await expect(service.verify('invalid_token')).rejects.toThrow(NotFoundException);
    });

    it('should verify and upgrade role', async () => {
      const mockClaim = {
        userId: new Types.ObjectId(),
        podcastId: new Types.ObjectId(),
        status: 'pending',
        expiresAt: new Date(Date.now() + 10000),
        save: jest.fn().mockResolvedValue(true),
      };
      
      execMock.mockResolvedValueOnce(mockClaim);
      authService.upgradeToCreator.mockResolvedValueOnce(true);

      const result = await service.verify('valid_token');

      expect(mockClaim.status).toBe('verified');
      expect(mockClaim.save).toHaveBeenCalled();
      expect(authService.upgradeToCreator).toHaveBeenCalledWith(mockClaim.userId.toString());
      expect(result.role).toBe('CREATOR');
    });

    it('should throw BadRequestException if token has expired', async () => {
      const mockClaim = {
        userId: new Types.ObjectId(),
        status: 'pending',
        expiresAt: new Date(Date.now() - 10000),
        save: jest.fn().mockResolvedValue(true),
      };
      
      execMock.mockResolvedValueOnce(mockClaim);

      await expect(service.verify('expired_token')).rejects.toThrow(BadRequestException);
      expect(mockClaim.status).toBe('expired');
      expect(mockClaim.save).toHaveBeenCalled();
    });
  });
});
