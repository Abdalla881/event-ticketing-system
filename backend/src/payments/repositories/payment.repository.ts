import { Inject, Injectable } from "@nestjs/common";
import { Payment } from "../payment.entity";
import { Pool } from "pg";

export interface IPaymentRepository {
    save(payment: Payment): Promise<void>;
    findById(id: string): Promise<Payment | null>;
    findByTransactionId(transactionId: string): Promise<Payment | null>;
}

@Injectable()
export class PaymentRepositoryImpl implements IPaymentRepository {
    constructor(@Inject('DATABASE_POOL') private pool: Pool) { }
    async save(payment: Payment): Promise<void> {
        const client = await this.pool.connect()
        try {
            await client.query(`BEGIN`)
            const query = `
            INSERT INTO payments(order_id,amount,status,transaction_id,provider)
            VALUES($1,$2,$3,$4,$5)
            RETURNING id
            `
            const result = await client.query(query, [payment.orderId, payment.amount, payment.status, payment.transactionId, payment.provider])
            payment.withId(result.rows[0].id)
            await client.query("COMMIT")
        } catch (error) {
            await client.query("ROLLBACK")
            throw error
        } finally {
            client.release()
        }
    }
    async findById(id: string): Promise<Payment | null> {
        const query = `
        SELECT * FROM payments WHERE id = $1
        `
        const result = await this.pool.query(query, [id])
        if (result.rows.length === 0) {
            throw new Error("Payment not found")
        }
        const payment = new Payment(result.rows[0].order_id, result.rows[0].amount, result.rows[0].provider)
        payment.withId(result.rows[0].id)
        payment.withStatus(result.rows[0].status)
        payment.withTransactionId(result.rows[0].transaction_id)
        return payment
    }
    
    async findByTransactionId(transactionId: string): Promise<Payment | null> {
        const query = `
        SELECT * FROM payments WHERE transaction_id = $1
        `
        const result = await this.pool.query(query, [transactionId])
        if (result.rows.length === 0) {
            throw new Error("Payment not found")
        }
        const payment = new Payment(result.rows[0].order_id, result.rows[0].amount, result.rows[0].provider)
        payment.withId(result.rows[0].id)
        payment.withStatus(result.rows[0].status)
        payment.withTransactionId(result.rows[0].transaction_id)
        return payment
    }
}   