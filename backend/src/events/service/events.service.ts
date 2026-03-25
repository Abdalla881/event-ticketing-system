import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventStatusDto, EventStatus } from '../dto/update-event-status.dto';



@Injectable()
export class EventsService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) { }

  async create(dto: CreateEventDto) {
    const {
      organizer_id,
      title,
      description,
      category,
      location,
      start_datetime,
      end_datetime,
      capacity,
    } = dto;

    // Date validation
    if (new Date(end_datetime) < new Date(start_datetime)) {
      throw new BadRequestException('end_datetime must be >= start_datetime');
    }

    const res = await this.pool.query(
      `INSERT INTO events
         (organizer_id, title, description, category, location, start_datetime, end_datetime, capacity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'upcoming')
       RETURNING *`,
      [organizer_id, title, description, category, location ?? null, start_datetime, end_datetime, capacity ?? null],
    );

    return res.rows[0];
  }

  async findAll() {
    const res = await this.pool.query(
      `SELECT e.*, o.name AS organizer_name
       FROM events e
       JOIN organizers o ON e.organizer_id = o.id
       ORDER BY e.created_at DESC`,
    );
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query(
      `SELECT e.*, o.name AS organizer_name
       FROM events e
       JOIN organizers o ON e.organizer_id = o.id
       WHERE e.id = $1`,
      [id],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return res.rows[0];
  }

  async updateStatus(id: string, dto: UpdateEventStatusDto) {
    const event = await this.findOne(id);



    if (event.status === 'cancelled') {
      throw new BadRequestException('Event is already cancelled');
    }

    const res = await this.pool.query(
      `UPDATE events SET status = $1 WHERE id = $2 RETURNING *`,
      [dto.status, id],
    );
    return res.rows[0];
  }

  async delete(id: string, requestingOrganizerId: string) {
    const event = await this.findOne(id);

    // Ownership check
    if (event.organizer_id !== requestingOrganizerId) {
      throw new ForbiddenException('You do not own this event');
    }

    await this.pool.query(`DELETE FROM events WHERE id = $1`, [id]);
    return { message: `Event with id ${id} deleted successfully` };
  }
}
