
export type TicketName = 'VIP' | 'Regular' | 'Student';

export class TicketType {
  id: string;
  event_id: string;
  name: TicketName;
  price: number;
  quantity_total: number;
  quantity_sold: number;
  sale_start?: Date;
  sale_end?: Date;
  created_at: Date;
}
