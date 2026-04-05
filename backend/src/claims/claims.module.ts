import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import {
  ClaimRequest,
  ClaimRequestSchema,
} from './schemas/claim-request.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClaimRequest.name, schema: ClaimRequestSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService],
})
export class ClaimsModule {}
