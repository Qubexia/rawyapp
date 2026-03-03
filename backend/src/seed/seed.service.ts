import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Role } from '../common/constants/roles.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    if (!adminEmail || !adminPassword) return;

    const existing = await this.usersService.findByEmail(adminEmail);
    if (existing) return;

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await this.usersService.create({
      name: 'Admin',
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
    });
  }
}
