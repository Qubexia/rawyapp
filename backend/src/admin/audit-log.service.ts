import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async logAction(
    adminId: string | Types.ObjectId,
    action: string,
    targetType: string,
    targetId: string | Types.ObjectId,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLogDocument> {
    const logEntry = new this.auditLogModel({
      adminId: new Types.ObjectId(adminId),
      action,
      targetType,
      targetId: new Types.ObjectId(targetId),
      details,
      ipAddress,
      userAgent,
    });

    const saved = await logEntry.save();
    this.logger.log(`Audit log: ${action} on ${targetType} ${targetId} by admin ${adminId}`);
    return saved;
  }

  async getLogsByAdmin(adminId: string, limit: number = 50): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({ adminId: new Types.ObjectId(adminId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getLogsByTarget(targetType: string, targetId: string, limit: number = 50): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({
        targetType,
        targetId: new Types.ObjectId(targetId),
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('adminId', 'name email')
      .exec();
  }
}