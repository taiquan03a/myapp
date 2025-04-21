import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import paymentApi from '../api/paymentApi';
import PaymentButton from '../components/PaymentButton';

const PaymentScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Gọi API backend tạo đơn hàng
      const response = await paymentApi.createPayment(95, 100000, "DEPOSIT");

      if (!response?.data?.orderUrl) {
        throw new Error('Không nhận được dữ liệu thanh toán từ server');
      }

      const orderUrl = response.data.orderUrl;

      // Điều hướng đến màn hình WebView và truyền orderUrl
      navigation.navigate('PaymentWebViewScreen', {
        orderUrl: orderUrl,
      });
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi', error.message || 'Lỗi tạo thanh toán');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#00C4B4" />
      ) : (
        <PaymentButton onPress={handlePayment} disabled={isLoading} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

export default PaymentScreen;
