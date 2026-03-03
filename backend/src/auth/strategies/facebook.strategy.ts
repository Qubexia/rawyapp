import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const appId = configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = configService.get<string>('FACEBOOK_APP_SECRET');
    const callbackUrl = configService.get<string>('FACEBOOK_CALLBACK_URL');

    if (!appId || !appSecret || !callbackUrl) {
      throw new Error('Facebook OAuth credentials are not configured properly');
    }

    super({
      clientID: appId,
      clientSecret: appSecret,
      callbackURL: callbackUrl,
      profileFields: ['id', 'emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user?: any) => void,
  ): Promise<any> {
    const { name, emails, id } = profile;

    const user = await this.authService.validateOAuthUser({
      provider: 'facebook',
      providerId: id,
      email: emails[0]?.value,
      name: name.givenName + ' ' + name.familyName,
    });

    done(null, user);
  }
}
