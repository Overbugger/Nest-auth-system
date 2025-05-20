import { Injectable, NestMiddleware } from '@nestjs/common';
import { auth } from 'express-oauth2-jwt-bearer';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    auth({
      secret: process.env.AUTH0_SECRET,
      audience: process.env.AUTH0_AUDIENCE,
      issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    })(req, res, next);
  }
}
