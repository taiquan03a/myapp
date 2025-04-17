import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import paymentApi from '../api/paymentApi';

const PaymentResultScreen = ({ route, navigation }) => {
    const {
        appTransId,
        status,
        amount,
        appid,
        bankcode,
        checksum,
        discountamount,
        pmcid,
        message,
    } = route.params || {};
    const [isLoading, setIsLoading] = useState(true);
    const [resultMessage, setResultMessage] = useState(message || '');

    useEffect(() => {
        const fetchPaymentStatus = async () => {
            try {
                const response = await paymentApi.checkPaymentStatus(appTransId);
                console.log('Payment status response:', response);
                setResultMessage(response.message || message || 'Không có thông tin chi tiết');
            } catch (error) {
                console.error('Error fetching payment status:', error);
                setResultMessage('Không thể kiểm tra trạng thái thanh toán');
            } finally {
                setIsLoading(false);
            }
        };

        if (appTransId) {
            fetchPaymentStatus();
        } else {
            setResultMessage('Không tìm thấy mã giao dịch');
            setIsLoading(false);
        }
    }, [appTransId]);

    const handleBackToHome = () => {
        navigation.navigate('Payment');
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Đang kiểm tra trạng thái...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {status === 'PAID' && (
                <>
                    <Image
                        source={{ uri: 'https://img.icons8.com/color/96/000000/checked--v1.png' }}
                        style={styles.icon}
                    />
                    <Text style={styles.title}>Thanh toán thành công</Text>
                    <Text style={styles.message}>Giao dịch của bạn đã hoàn tất.</Text>
                </>
            )}
            {(status === 'FAILED' || status === 'UNKNOWN') && (
                <>
                    <Image
                        source={{ uri: 'https://img.icons8.com/color/96/000000/cancel--v1.png' }}
                        style={styles.icon}
                    />
                    <Text style={styles.title}>Thanh toán thất bại</Text>
                    <Text style={styles.message}>Đã có lỗi xảy ra.</Text>
                </>
            )}
            <Text style={styles.details}>Mã giao dịch: {appTransId}</Text>
            <Text style={styles.details}>Số tiền: {amount}</Text>
            <Text style={styles.details}>App ID: {appid}</Text>
            <Text style={styles.details}>Mã ngân hàng: {bankcode || 'Không có'}</Text>
            <Text style={styles.details}>Checksum: {checksum}</Text>
            <Text style={styles.details}>Số tiền giảm giá: {discountamount || 0}</Text>
            <Text style={styles.details}>Phương thức thanh toán: {pmcid}</Text>
            <Text style={styles.details}>Thông tin: {resultMessage}</Text>
            <Button title="Quay lại" onPress={handleBackToHome} color="#00C4B4" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    icon: {
        width: 96,
        height: 96,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    details: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
});

export default PaymentResultScreen;