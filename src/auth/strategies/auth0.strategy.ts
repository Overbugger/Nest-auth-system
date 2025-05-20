import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';
import { auth0Config } from '../../config/auth0.config';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor() {
    super({
      domain: auth0Config.domain,
      clientID: auth0Config.clientId,
      clientSecret: auth0Config.clientSecret,
      callbackURL: auth0Config.callbackURL,
      scope: 'openid profile email',
      state: false,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
    };
  }
}
