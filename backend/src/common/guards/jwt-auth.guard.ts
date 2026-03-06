import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Attempt to extract and validate the JWT so that request.user is
      // populated for authenticated users. If no token is present (anonymous
      // access) or the token is invalid we simply swallow the error and allow
      // the request through — the controller handles the null-user case.
      try {
        await super.canActivate(context);
      } catch {
        // No token or invalid token on a public route → that's fine.
      }
      return true;
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
