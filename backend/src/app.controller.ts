import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiCommonErrorResponses } from './common/decorators/api-error-responses.decorator';

@ApiTags('app')
@ApiCommonErrorResponses()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'OK' })
  getHello(): string {
    return this.appService.getHello();
  }
}
