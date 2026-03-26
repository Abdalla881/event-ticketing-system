import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketTypesService } from './service/ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

// ───── mock pool helper ────────────────────────────────────────────────────────
const makeMockPool = (...resultSets: Record<string, unknown>[][]) => {
  let call = 0;
  return {
    query: jest.fn().mockImplementation(() => {
      const rows = resultSets[call] ?? [];
      call++;
      return Promise.resolve({ rows });
    }),
  };
};

// ───── fixtures ────────────────────────────────────────────────────────────────
const EVENT_ID = 'aaaaaaaa-0000-0000-0000-000000000001';
const TICKET_ID = 'bbbbbbbb-0000-0000-0000-000000000001';

const storedTicket = {
  id: TICKET_ID,
  event_id: EVENT_ID,
  name: 'VIP',
  price: 200,
  quantity_total: 100,
  quantity_sold: 0,
  sale_start: null,
  sale_end: null,
  created_at: new Date().toISOString(),
};

const baseCreateDto: CreateTicketTypeDto = {
  event_id: EVENT_ID,
  name: 'VIP',
  price: 200,
  quantity_total: 100,
};

// ──────────────────────────────────────────────────────────────────────────────

describe('TicketTypesService', () => {
  // ── create ──────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create a ticket type and return the row', async () => {
      // pool calls: eventCheck → insert
      const pool = makeMockPool([{ id: EVENT_ID }], [storedTicket]);
      const service = new TicketTypesService(pool as any);

      const result = await service.create(baseCreateDto);
      expect(result.name).toBe('VIP');
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      const pool = makeMockPool([]); // eventCheck returns nothing
      const service = new TicketTypesService(pool as any);

      await expect(service.create(baseCreateDto)).rejects.toThrow(NotFoundException);
    });

    it('should reject when sale_end < sale_start', async () => {
      const pool = makeMockPool([{ id: EVENT_ID }]);
      const service = new TicketTypesService(pool as any);

      const dto: CreateTicketTypeDto = {
        ...baseCreateDto,
        sale_start: '2026-07-01T00:00:00Z',
        sale_end: '2026-06-01T00:00:00Z', // before start
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should allow equal sale_start and sale_end', async () => {
      const pool = makeMockPool([{ id: EVENT_ID }], [storedTicket]);
      const service = new TicketTypesService(pool as any);

      const dto: CreateTicketTypeDto = {
        ...baseCreateDto,
        sale_start: '2026-06-01T00:00:00Z',
        sale_end: '2026-06-01T00:00:00Z',
      };

      await expect(service.create(dto)).resolves.not.toThrow();
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return the ticket type when found', async () => {
      const pool = makeMockPool([storedTicket]);
      const service = new TicketTypesService(pool as any);

      const result = await service.findOne(TICKET_ID);
      expect(result.id).toBe(TICKET_ID);
    });

    it('should throw NotFoundException when not found', async () => {
      const pool = makeMockPool([]);
      const service = new TicketTypesService(pool as any);

      await expect(service.findOne('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update the ticket type', async () => {
      const updated = { ...storedTicket, price: 300 };
      const pool = makeMockPool([storedTicket], [updated]);
      const service = new TicketTypesService(pool as any);

      const dto: UpdateTicketTypeDto = { price: 300 };
      const result = await service.update(TICKET_ID, dto);
      expect(result.price).toBe(300);
    });

    it('should reject if quantity_total < quantity_sold', async () => {
      const ticketWithSales = { ...storedTicket, quantity_sold: 50 };
      const pool = makeMockPool([ticketWithSales]);
      const service = new TicketTypesService(pool as any);

      const dto: UpdateTicketTypeDto = { quantity_total: 10 }; // less than sold
      await expect(service.update(TICKET_ID, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no fields provided', async () => {
      const pool = makeMockPool([storedTicket]);
      const service = new TicketTypesService(pool as any);

      await expect(service.update(TICKET_ID, {})).rejects.toThrow(BadRequestException);
    });
  });

  // ── delete ───────────────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('should delete ticket type when no tickets sold', async () => {
      const pool = makeMockPool([storedTicket], []);
      const service = new TicketTypesService(pool as any);

      const result = await service.delete(TICKET_ID);
      expect(result.message).toContain(TICKET_ID);
    });

    it('should reject deletion when tickets are already sold', async () => {
      const ticketWithSales = { ...storedTicket, quantity_sold: 5 };
      const pool = makeMockPool([ticketWithSales]);
      const service = new TicketTypesService(pool as any);

      await expect(service.delete(TICKET_ID)).rejects.toThrow(BadRequestException);
    });
  });
});
