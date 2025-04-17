import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const paymentApi = {
    async createPayment(bookingId, amount) {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/payment/create_ỏder`, {
                bookingId,
                amount,
            });
            return response.data; // Trả về { statusCode, message, data }
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể tạo thanh toán');
        }
    },

    async checkPaymentStatus(appTransId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/payment/status?appTransId=${appTransId}`);
            return response.data.data; // Trả về { appTransId, status, message }
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể kiểm tra trạng thái');
        }
    },
};

export default paymentApi;