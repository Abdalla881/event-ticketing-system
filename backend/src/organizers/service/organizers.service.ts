import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateOrganizerDto } from '../dto/create-organizer.dto';
import { UpdateOrganizerDto } from '../dto/update-organizer.dto';

@Injectable()
export class OrganizersService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}
  async findAll() {
    const res = await this.pool.query(
      'select * , user_name from organizers join users on organizers.user_id = users.id',
    );
    if (res.rows.length === 0) {
      throw new NotFoundException('No organizers found');
    }
    return res.rows;
  }
  async create(createOrganizerData: CreateOrganizerDto) {
    const { user_id, name, description } = createOrganizerData;
    if (!user_id || !name || !description) {
      throw new NotFoundException('Missing required fields');
    }
    const res = await this.pool.query(
      `INSERT INTO organizers (user_id, name, description)
   VALUES ($1, $2, $3)
   RETURNING *`,
      [user_id, name, description],
    );
    if (res.rows.length === 0) {
      throw new BadRequestException('Organizer not created');
    }
    return res.rows[0];
  }
  async findOne(id: string) {
    const res = await this.pool.query(
      'select o.*, u.user_name as user_name from organizers o join users u on o.user_id = u.id where o.id = $1',
      [id],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException('Organizer not found');
    }
    return res.rows[0];
  }
  async update(id: string, updateOrganizerData: UpdateOrganizerDto) {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const key in updateOrganizerData) {
      fields.push(`${key} = $${index}`);
      values.push(updateOrganizerData[key]);
      index++;
    }

    if (fields.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id);

    const query = `
            update organizers
            set ${fields.join(', ')}
            where id = $${index}
            returning *
          `;

    const res = await this.pool.query(query, values);

    if (res.rows.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return res.rows[0];
  }
  async delete(id: string) {
    const res = await this.pool.query(
      'delete from organizers where id = $1 returning *',
      [id],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException(`Organizer with id ${id} not deleted`);
    }
    return { message: `organizer with id ${id} deleted successfully` };
  }
}
