import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../service/auth.service';

@Injectable()
export class GoogleStrategyImpl extends PassportStrategy(
  GoogleStrategy,
  'google',
) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    if (!profile.emails || profile.emails.length === 0) {
      throw new UnauthorizedException(
        'No email associated with this Google account',
      );
    }

    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      googleId: profile.id,
      name: profile.displayName,
    });

    return user;
  }
}

