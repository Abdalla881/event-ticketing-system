import {
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';

/**
 * JWT validation helper service.
 * Used to validate a JWT token and fetch the associated user from the DB.
 * This replaces passport-jwt strategy.
 */
@Injectable()
export class JwtStrategy {
  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async validateToken(token: string) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const res = await this.pool.query(
      'SELECT id, email, role, updated_at FROM users WHERE id = $1',
      [payload.sub],
    );

    if (res.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    return { id: res.rows[0].id, role: res.rows[0].role };
  }
}

