import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}
  private excludePassword(user: any) {
    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    const res = await this.pool.query('select * from users');
    if (res.rows.length === 0) {
      throw new NotFoundException('No users found');
    }
    return this.excludePassword(res.rows);
  }

  async findOne(id: string) {
    const user = await this.pool.query(`select * from users where id = $1`, [
      id,
    ]);
    if (user.rows.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.excludePassword(user.rows[0]);
  }

  async create(createUserData) {
    const { first_name, last_name, email, password, status, phone } =
      createUserData;

    // Check if email already exists
    const existingUser = await this.pool.query(
      'select * from users where email = $1',
      [email],
    );
    if (existingUser.rows.length > 0) {
      throw new NotFoundException('Email already exists');
    }
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const res = await this.pool.query(
      'insert into users (first_name,last_name,email,password,status,phone) values ($1,$2,$3,$4,$5,$6) returning *',
      [first_name, last_name, email, hashedPassword, status, phone],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException('User not created');
    }

    return this.excludePassword(res.rows[0]);
  }

  async update(id: string, updateUserData: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const key in updateUserData) {
      if (key === 'password') {
        updateUserData.password = await bcrypt.hash(
          updateUserData.password,
          10,
        );
      }

      fields.push(`${key} = $${index}`);
      values.push(updateUserData[key]);
      index++;
    }

    if (fields.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id);

    const query = `
    update users
    set ${fields.join(', ')}
    where id = $${index}
    returning *
  `;

    const res = await this.pool.query(query, values);

    if (res.rows.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.excludePassword(res.rows[0]);
  }

  async delete(id: string) {
    const res = await this.pool.query(
      'delete from users where id = $1 returning *',
      [id],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException(`User with id ${id} not deleted`);
    }
  }
}
