export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export class Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  created_at: Date;
  start_datetime: Date;
  end_datetime: Date;
  capacity?: number;
  status: EventStatus;
}
