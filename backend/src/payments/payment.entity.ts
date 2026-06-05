
export enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed"
}

export enum PaymentProvider {
    STRIPE = "stripe",
    PAYPAL = "paypal"
}


export class Payment {
    id?: string;
    orderId: string;
    amount: number;
    status: string;
    transactionId: string;
    createdAt: Date;
    updatedAt: Date;
    provider: string;
    constructor(orderId: string, amount: number, provider: string) {
        this.orderId = orderId;
        this.amount = amount;
        this.transactionId = "";
        this.status = "pending";
        this.provider = provider;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    withTransactionId(transactionId: string) {
        this.transactionId = transactionId;
        return this;
    }
    withStatus(status: string) {
        this.status = status;
        return this;
    }

    withId(id: string) {
        this.id = id;
        return this;
    }
    markAsPaid() {
        if (this.status === PaymentStatus.PAID) {
            throw new Error("Payment is already paid");
        }

        this.status = PaymentStatus.PAID;
        this.updatedAt = new Date();
        return this;
    }
    markAsFailed() {
        if (this.status === PaymentStatus.PAID) {
            throw new Error("Payment is already paid");
        }
        this.status = PaymentStatus.FAILED;
        this.updatedAt = new Date();
        return this;
    }
}