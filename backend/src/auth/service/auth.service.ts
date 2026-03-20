import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Pool } from 'pg';
import { SignUpUserDto } from '../dto/signUp-user.dto';
import { LogInDto } from '../dto/logIn.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
    private readonly jwtService: JwtService,
  ) { }

  private excludePassword(user: any) {
    const { password, reset_code, reset_code_expires, reset_code_verified, ...result } = user;
    return result;
  }

  // @desc sign up a new user
  async signup(userData: SignUpUserDto) {
    const { user_name, email, password } = userData;

    // 1) Check if email already exists
    const existing = await this.pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException('Email already exists');
    }

    // 2) Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3) Insert new user
    const res = await this.pool.query(
      `INSERT INTO users (user_name, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_name, email, hashedPassword],
    );

    const user = res.rows[0];

    // 4) Generate JWT
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      message: 'User created successfully',
      user: this.excludePassword(user),
      token: await this.jwtService.signAsync(payload),
    };
  }

  // @desc log in a user
  async login(logInData: LogInDto) {
    const { email, password } = logInData;

    // 1) Find user by email (include password for comparison)
    const res = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    if (res.rows.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = res.rows[0];

    // 2) Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3) Generate JWT
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      user: this.excludePassword(user),
      token: await this.jwtService.signAsync(payload),
    };
  }

  // @desc send forget password reset code
  async forgetPassword(email: string) {
    // 1) Check if user exists
    const res = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    if (res.rows.length === 0) {
      throw new UnauthorizedException('Email not found');
    }

    // 2) Generate a reset code and hash it
    const resetCode = crypto.randomBytes(3).toString('hex');
    const hashedResetCode = await bcrypt.hash(resetCode, 10);
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3) Store reset code in DB
    await this.pool.query(
      `UPDATE users
       SET reset_code = $1,
           reset_code_expires = $2,
           reset_code_verified = false
       WHERE email = $3`,
      [hashedResetCode, resetCodeExpires, email],
    );

    // 4) Return the plain reset code (send via email in a real app)
    return {
      message: 'Password reset code generated. Share it with the user.',
      resetCode, // In production, remove this and send via email
    };
  }

  // @desc verify the reset code
  async verifyResetCode(email: string, code: string) {
    // 1) Get user with reset code data
    const res = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    if (res.rows.length === 0) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    const user = res.rows[0];

    if (!user.reset_code) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    // 2) Check if code is valid and not expired
    const isValid = await bcrypt.compare(code, user.reset_code);
    if (!isValid || !user.reset_code_expires || user.reset_code_expires < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    // 3) Mark code as verified
    await this.pool.query(
      'UPDATE users SET reset_code_verified = true WHERE email = $1',
      [email],
    );

    return { message: 'Reset code verified successfully' };
  }

  // @desc reset password with verified code
  async resetPassword(email: string, newPassword: string) {
    // 1) Check if reset code was verified
    const res = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    if (res.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const user = res.rows[0];

    if (!user.reset_code_verified) {
      throw new UnauthorizedException('Reset code not verified');
    }

    // 2) Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3) Update password and clear reset fields
    await this.pool.query(
      `UPDATE users
       SET password = $1,
           reset_code = NULL,
           reset_code_expires = NULL,
           reset_code_verified = false,
           updated_at = NOW()
       WHERE email = $2`,
      [hashedPassword, email],
    );

    return {
      message: 'Password has been reset successfully. Please login again.',
    };
  }

  // @desc validate or upsert a Google-authenticated user
  async validateGoogleUser(data: {
    email: string;
    googleId: string;
    name: string;
  }) {
    // 1) Check if user already exists
    const res = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [data.email],
    );

    if (res.rows.length > 0) {
      const user = res.rows[0];

      // 2a) If user exists but has no google_id yet — update it
      if (!user.google_id) {
        const updated = await this.pool.query(
          `UPDATE users
           SET google_id = $1, provider = 'google', updated_at = NOW()
           WHERE email = $2
           RETURNING *`,
          [data.googleId, data.email],
        );
        return this.excludePassword(updated.rows[0]);
      }

      return this.excludePassword(user);
    }

    // 2b) Create new user via Google (no password required)
    const newUser = await this.pool.query(
      `INSERT INTO users (user_name, email, google_id, provider, role)
       VALUES ($1, $2, $3, 'google', 'user')
       RETURNING *`,
      [data.name, data.email, data.googleId],
    );

    return this.excludePassword(newUser.rows[0]);
  }

  // @desc generate a JWT for a Google-authenticated user
  async googleLogin(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      user,
      token: await this.jwtService.signAsync(payload),
    };
  }
}

