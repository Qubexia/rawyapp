import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Common API error response decorators for Swagger (400, 401, 403, 404, 409).
 * Apply at controller or method level to document standard error responses.
 */
export function ApiCommonErrorResponses() {
  return applyDecorators(
    ApiResponse({ status: 400, description: 'Bad request / validation error' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not found' }),
    ApiResponse({ status: 409, description: 'Conflict (e.g. duplicate)' }),
  );
}
