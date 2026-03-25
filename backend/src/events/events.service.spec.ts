import { EventsService } from './service/events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

// ───── mock pool helper ───────────────────────────────────────────────────────
const makeMockPool = (rows: Record<string, unknown>[] = []) => ({
  query: jest.fn().mockResolvedValue({ rows }),
});

// ───── shared fixtures ────────────────────────────────────────────────────────
const ORGANIZER_ID = 'a1b2c3d4-0000-0000-0000-000000000001';
const OTHER_ORGANIZER_ID = 'ffffffff-0000-0000-0000-000000000002';
const EVENT_ID = 'e1e2e3e4-0000-0000-0000-000000000001';

const baseCreateDto: CreateEventDto = {
  organizer_id: ORGANIZER_ID,
  title: 'NestJS Workshop',
  description: 'A hands-on backend event',
  category: 'tech',
  location: 'Cairo',
  start_datetime: '2026-06-01T10:00:00Z',
  end_datetime: '2026-06-01T18:00:00Z',
  capacity: 100,
};

const storedEvent = {
  id: EVENT_ID,
  organizer_id: ORGANIZER_ID,
  ...baseCreateDto,
  status: 'draft',
  created_at: new Date().toISOString(),
};

// ─────────────────────────────────────────────────────────────────────────────

describe('EventsService', () => {
  // ── create ──────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should insert event and return the created row', async () => {
      const pool = makeMockPool([storedEvent]);
      const service = new EventsService(pool as any);

      const result = await service.create(baseCreateDto);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result.title).toBe('NestJS Workshop');
      expect(result.status).toBe('draft');
    });

    it('should reject when end_datetime < start_datetime', async () => {
      const pool = makeMockPool();
      const service = new EventsService(pool as any);

      const dto: CreateEventDto = {
        ...baseCreateDto,
        start_datetime: '2026-06-02T10:00:00Z',
        end_datetime: '2026-06-01T10:00:00Z', // before start
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(pool.query).not.toHaveBeenCalled(); // should fail before DB hit
    });

    it('should allow end_datetime equal to start_datetime', async () => {
      const pool = makeMockPool([{ ...storedEvent }]);
      const service = new EventsService(pool as any);

      const dto: CreateEventDto = {
        ...baseCreateDto,
        start_datetime: '2026-06-01T10:00:00Z',
        end_datetime: '2026-06-01T10:00:00Z', // same is valid
      };

      await expect(service.create(dto)).resolves.not.toThrow();
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return the event when found', async () => {
      const pool = makeMockPool([storedEvent]);
      const service = new EventsService(pool as any);

      const result = await service.findOne(EVENT_ID);
      expect(result.id).toBe(EVENT_ID);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      const pool = makeMockPool([]); // empty result
      const service = new EventsService(pool as any);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateStatus ─────────────────────────────────────────────────────────────
  describe('updateStatus()', () => {
    it('should allow draft → published', async () => {
      const updatedEvent = { ...storedEvent, status: 'published' };
      const pool = {
        query: jest
          .fn()
          .mockResolvedValueOnce({ rows: [storedEvent] }) // findOne
          .mockResolvedValueOnce({ rows: [updatedEvent] }), // update
      };
      const service = new EventsService(pool as any);

      const dto: UpdateEventStatusDto = { status: 'published' };
      const result = await service.updateStatus(EVENT_ID, dto, ORGANIZER_ID);

      expect(result.status).toBe('published');
    });

    it('should allow draft → cancelled', async () => {
      const updatedEvent = { ...storedEvent, status: 'cancelled' };
      const pool = {
        query: jest
          .fn()
          .mockResolvedValueOnce({ rows: [storedEvent] })
          .mockResolvedValueOnce({ rows: [updatedEvent] }),
      };
      const service = new EventsService(pool as any);

      const dto: UpdateEventStatusDto = { status: 'cancelled' };
      const result = await service.updateStatus(EVENT_ID, dto, ORGANIZER_ID);
      expect(result.status).toBe('cancelled');
    });

    it('should allow published → cancelled', async () => {
      const publishedEvent = { ...storedEvent, status: 'published' };
      const cancelledEvent = { ...storedEvent, status: 'cancelled' };
      const pool = {
        query: jest
          .fn()
          .mockResolvedValueOnce({ rows: [publishedEvent] })
          .mockResolvedValueOnce({ rows: [cancelledEvent] }),
      };
      const service = new EventsService(pool as any);

      const dto: UpdateEventStatusDto = { status: 'cancelled' };
      const result = await service.updateStatus(EVENT_ID, dto, ORGANIZER_ID);
      expect(result.status).toBe('cancelled');
    });

    it('should reject cancelled → published (no way back)', async () => {
      const cancelledEvent = { ...storedEvent, status: 'cancelled' };
      const pool = { query: jest.fn().mockResolvedValue({ rows: [cancelledEvent] }) };
      const service = new EventsService(pool as any);

      const dto: UpdateEventStatusDto = { status: 'published' };
      await expect(service.updateStatus(EVENT_ID, dto, ORGANIZER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject published → draft (no going back to draft)', async () => {
      const publishedEvent = { ...storedEvent, status: 'published' };
      const pool = { query: jest.fn().mockResolvedValue({ rows: [publishedEvent] }) };
      const service = new EventsService(pool as any);

      const dto: UpdateEventStatusDto = { status: 'draft' };
      await expect(service.updateStatus(EVENT_ID, dto, ORGANIZER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException when non-owner tries to update status', async () => {
      const pool = { query: jest.fn().mockResolvedValue({ rows: [storedEvent] }) };
      const service = new EventsService(pool as any);

      const dto: UpdateEventStatusDto = { status: 'published' };
      await expect(service.updateStatus(EVENT_ID, dto, OTHER_ORGANIZER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── delete ───────────────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('should delete the event for the owner', async () => {
      const pool = {
        query: jest
          .fn()
          .mockResolvedValueOnce({ rows: [storedEvent] }) // findOne
          .mockResolvedValueOnce({ rows: [] }), // delete
      };
      const service = new EventsService(pool as any);

      const result = await service.delete(EVENT_ID, ORGANIZER_ID);
      expect(result.message).toContain(EVENT_ID);
    });

    it('should throw ForbiddenException when non-owner tries to delete', async () => {
      const pool = { query: jest.fn().mockResolvedValue({ rows: [storedEvent] }) };
      const service = new EventsService(pool as any);

      await expect(service.delete(EVENT_ID, OTHER_ORGANIZER_ID)).rejects.toThrow(ForbiddenException);
    });
  });
});
