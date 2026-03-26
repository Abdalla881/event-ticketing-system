import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateTicketTypeDto } from '../dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from '../dto/update-ticket-type.dto';

@Injectable()
export class TicketTypesService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) { }

  async create(dto: CreateTicketTypeDto) {
    const { event_id, name, price, quantity_total, sale_start, sale_end } = dto;

    // Sale window date validation
    if (sale_start && sale_end && new Date(sale_end) < new Date(sale_start)) {
      throw new BadRequestException('sale_end must be >= sale_start');
    }

    // Verify event exists
    const eventCheck = await this.pool.query(
      'SELECT id FROM events WHERE id = $1',
      [event_id],
    );
    if (eventCheck.rows.length === 0) {
      throw new NotFoundException(`Event with id ${event_id} not found`);
    }

    const res = await this.pool.query(
      `INSERT INTO ticket_type
         (event_id, name, price, quantity_total, quantity_sold, sale_start, sale_end)
       VALUES ($1, $2, $3, $4, 0, $5, $6)
       RETURNING *`,
      [
        event_id,
        name,
        price,
        quantity_total,
        sale_start ?? null,
        sale_end ?? null,
      ],
    );

    return res.rows[0];
  }

  async findAllByEvent(eventId: string) {
    // Verify event exists
    const eventCheck = await this.pool.query(
      'SELECT id FROM events WHERE id = $1',
      [eventId],
    );
    if (eventCheck.rows.length === 0) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    const res = await this.pool.query(
      `SELECT * FROM ticket_type WHERE event_id = $1 ORDER BY created_at ASC`,
      [eventId],
    );
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query(
      'SELECT * FROM ticket_type WHERE id = $1',
      [id],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException(`Ticket type with id ${id} not found`);
    }
    return res.rows[0];
  }

  async update(id: string, dto: UpdateTicketTypeDto) {
    const existing = await this.findOne(id);

    // Sale window date validation
    const newSaleStart = dto.sale_start ?? existing.sale_start;
    const newSaleEnd = dto.sale_end ?? existing.sale_end;
    if (newSaleStart && newSaleEnd && new Date(newSaleEnd) < new Date(newSaleStart)) {
      throw new BadRequestException('sale_end must be >= sale_start');
    }

    // Cannot reduce quantity_total below quantity_sold
    if (dto.quantity_total !== undefined && dto.quantity_total < existing.quantity_sold) {
      throw new BadRequestException(
        `quantity_total cannot be less than current quantity_sold (${existing.quantity_sold})`,
      );
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const key of Object.keys(dto)) {
      const value = (dto as any)[key];

      if (value !== undefined && value !== null) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (fields.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id);
    const res = await this.pool.query(
      `UPDATE ticket_type SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
      values,
    );

    return res.rows[0];
  }

  async delete(id: string) {
    const existing = await this.findOne(id);

    if (existing.quantity_sold > 0) {
      throw new BadRequestException(
        'Cannot delete a ticket type that already has sold tickets',
      );
    }

    await this.pool.query('DELETE FROM ticket_type WHERE id = $1', [id]);
    return { message: `Ticket type with id ${id} deleted successfully` };
  }
}
