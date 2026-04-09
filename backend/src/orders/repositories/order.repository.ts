import { Order } from "../order.entity";
import { Pool } from "pg";
import { Inject, Injectable } from "@nestjs/common";

export interface IOrderRepository {
    save(order: Order): Promise<void>;

    findById(id: string): Promise<Order | null>;
}

@Injectable()
export class OrderRepositoryImpl implements IOrderRepository {
    constructor(@Inject('DATABASE_POOL') private pool: Pool) { }
    async save(order: Order): Promise<void> {
        const client = await this.pool.connect()
        try {
            await client.query(`BEGIN`)


            //1- insert order
            const orderQuery = `
            INSERT INTO orders(user_id,total_amount,status,is_tickets_generated)
            VALUES($1,$2,$3,$4)
            RETURNING id
            `
            const orderResult = await client.query(orderQuery, [order.userId, order.totalAmount, order.status, order.isTicketsGenerated])


            const orderId = orderResult.rows[0].id
            order.withId(orderId)  // to set the id of the order in the entity




            //2- insert order items
            const orderItemQuery = `
            INSERT INTO order_items(order_id,ticket_type_id,quantity,unit_price)
            VALUES($1,$2,$3,$4)
            `
            //3- update ticket stock
            const ticketStockQuery = `
            UPDATE ticket_type
            SET quantity_sold = quantity_sold + $1
            WHERE id = $2
            AND quantity_sold + $1 <= quantity_total
            RETURNING id;
            `

            for (const item of order.items) {

                const result = await client.query(ticketStockQuery, [item.quantity, item.ticketTypeId])
                if (result.rows.length === 0) {
                    throw new Error("Not enough tickets")
                }
                await client.query(orderItemQuery, [order.id, item.ticketTypeId, item.quantity, item.price])
            }


            await client.query("COMMIT")

        } catch (error) {
            await client.query("ROLLBACK")
            throw error
        } finally {
            client.release()
        }
    }
    async findById(id: string): Promise<Order | null> {
        const query = `
      SELECT o.* ,oi.* FROM orders o  LEFT JOIN order_items oi on o.id = oi.order_id WHERE o.id = $1
    `;
        const order = await this.pool.query(query, [id])
        if (order.rows.length === 0) {
            throw new Error("Order not found")
        }
        const orderEntity = new Order(order.rows[0].user_id)
        const orderId = order.rows[0].id
        orderEntity.withId(orderId)

        orderEntity.totalAmount = order.rows[0].total_amount
        orderEntity.status = order.rows[0].status
        orderEntity.isTicketsGenerated = order.rows[0].is_tickets_generated
        orderEntity.createdAt = new Date(order.rows[0].created_at)
        orderEntity.updatedAt = new Date(order.rows[0].updated_at)
        orderEntity.currency = order.rows[0].currency
        order.rows.forEach((row) => {
            if (!row.ticket_type_id) return;
            orderEntity.items.push({
                ticketTypeId: row.ticket_type_id,
                quantity: row.quantity,
                price: row.unit_price,
                totalPrice: row.total_price,
            })
        })
        return orderEntity
    }
}