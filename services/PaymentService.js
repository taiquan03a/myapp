import { ZALOPAY_CONFIG } from '../config/zalopay';

export class PaymentService {
    static async createOrder(orderId, amount) {
        try {
            const response = await fetch(`${ZALOPAY_CONFIG.API_BASE_URL}/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    amount,
                }),
            });

            const data = await response.json();
            if (data.returnCode !== 1) {
                throw new Error(data.returnMessage || 'Failed to create order');
            }

            return {
                zpTransToken: data.zpTransToken,
                appTransId: data.appTransId,
            };
        } catch (error) {
            throw new Error(`Create order failed: ${error.message}`);
        }
    }

    static async checkOrderStatus(appTransId) {
        try {
            const response = await fetch(`${ZALOPAY_CONFIG.API_BASE_URL}/order-status?appTransId=${appTransId}`);
            const data = await response.json();

            if (data.returnCode === 1 && !data.isProcessing) {
                return {
                    status: data.zpTransId ? 'SUCCESS' : 'FAILED',
                    amount: data.amount,
                    zpTransId: data.zpTransId,
                };
            } else {
                throw new Error(data.returnMessage || 'Order is still processing');
            }
        } catch (error) {
            throw new Error(`Check status failed: ${error.message}`);
        }
    }
}