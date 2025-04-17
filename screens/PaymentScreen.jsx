import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Dimensions, Text, Button, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import PaymentButton from '../components/PaymentButton';
import * as Linking from 'expo-linking';
import paymentApi from '../api/paymentApi';

const { width, height } = Dimensions.get('window');

const PaymentScreen = ({ navigation }) => {
  useEffect(() => {
    const handleDeepLink = (event) => {
      const data = Linking.parse(event.url);
      console.log('Deeplink received:', data);
      if (data.path === 'payment-result') {
        const { status, order_id } = data.queryParams;
        if (status === '1') {
          Alert.alert('Thanh toán thành công', `Mã đơn: ${order_id}`);
        } else {
          Alert.alert('Thanh toán thất bại', `Mã đơn: ${order_id}`);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [appTransId, setAppTransId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý nút back Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleAndroidBack
    );
    return () => backHandler.remove();
  }, [paymentUrl]);

  const handleAndroidBack = () => {
    if (paymentUrl) {
      setPaymentUrl(null);
      return true;
    }
    return false;
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await paymentApi.createPayment('1', 100000);
      console.log('Payment response:', response);

      if (!response?.data?.orderUrl) {
        throw new Error('Không nhận được dữ liệu thanh toán từ server');
      }

      const orderUrl = response.data.orderUrl;
      const transId = response.data.appTransId;
      console.log('Order URL:', orderUrl);
      console.log('App Trans ID:', transId);
      setPaymentUrl(orderUrl);
      setAppTransId(transId);
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi', error.message || 'Lỗi tạo thanh toán');
      resetState();
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    console.log('Resetting state');
    setPaymentUrl(null);
    setAppTransId(null);
  };

  const parseRedirectParams = (url, fallbackTransId) => {
    try {
      const queryString = url.split('?')[1] || '';
      const urlParams = new URLSearchParams(queryString);
      const params = {
        amount: urlParams.get('amount') ? Number(urlParams.get('amount')) : undefined,
        appid: urlParams.get('appid') || undefined,
        appTransId: urlParams.get('apptransid') || urlParams.get('appTransId') || fallbackTransId,
        bankcode: urlParams.get('bankcode') || undefined,
        checksum: urlParams.get('checksum') || undefined,
        discountamount: urlParams.get('discountamount') ? Number(urlParams.get('discountamount')) : undefined,
        pmcid: urlParams.get('pmcid') || undefined,
        status: urlParams.get('status') ? Number(urlParams.get('status')) : undefined,
        message: urlParams.get('message') || '',
      };
      console.log('Parsed redirect params:', params);
      return params;
    } catch (error) {
      console.error('Error parsing redirect URL:', error);
      return {
        appTransId: fallbackTransId,
        status: undefined,
        message: 'Invalid redirect URL',
      };
    }
  };

  const handleNavigationStateChange = (navState) => {
    try {
      const { url } = navState;
      console.log('Navigation state changed, URL:', url);

      if (!url || typeof url !== 'string') {
        console.log('URL không hợp lệ hoặc không tồn tại');
        return;
      }

      // Kiểm tra redirect từ myapp://payment-result
      if (url.startsWith('myapp://payment-result')) {
        console.log('MyApp redirect detected in onNavigationStateChange');
        const params = parseRedirectParams(url, appTransId);

        if (params.appTransId) {
          console.log('Navigating to PaymentResultScreen with params:', params);
          resetState();
          navigation.navigate('PaymentResultScreen', {
            appTransId: params.appTransId,
            status: params.status === 1 ? 'PAID' : params.status === -1 ? 'FAILED' : 'UNKNOWN',
            amount: params.amount,
            appid: params.appid,
            bankcode: params.bankcode,
            checksum: params.checksum,
            discountamount: params.discountamount,
            pmcid: params.pmcid,
            message: params.message,
          });
        } else {
          console.log('Missing appTransId in redirect params');
          Alert.alert('Lỗi', 'Không tìm thấy mã giao dịch');
          resetState();
        }
        return;
      }

      // Kiểm tra redirect từ ZaloPay (https://docs.zalopay.vn/v2/)
      if (url.includes('https://docs.zalopay.vn/v2/')) {
        console.log('ZaloPay redirect detected in onNavigationStateChange');
        const params = parseRedirectParams(url, appTransId);

        if (params.appTransId) {
          console.log('Navigating to PaymentResultScreen with params:', params);
          resetState();
          navigation.navigate('PaymentResultScreen', {
            appTransId: params.appTransId,
            status: params.status === 1 ? 'PAID' : params.status === -1 ? 'FAILED' : 'UNKNOWN',
            amount: params.amount,
            appid: params.appid,
            bankcode: params.bankcode,
            checksum: params.checksum,
            discountamount: params.discountamount,
            pmcid: params.pmcid,
            message: params.message,
          });
        } else {
          console.log('Missing appTransId in redirect params');
          Alert.alert('Lỗi', 'Không tìm thấy mã giao dịch');
          resetState();
        }
        return;
      }

      // Kiểm tra redirect từ backend (exp://172.19.200.240:8081/payment-result)
      if (url.includes('exp://') && url.includes('payment-result')) {
        console.log('Expo redirect detected in onNavigationStateChange');
        const params = parseRedirectParams(url, appTransId);

        if (params.appTransId) {
          console.log('Navigating to PaymentResultScreen with params:', params);
          resetState();
          navigation.navigate('PaymentResultScreen', {
            appTransId: params.appTransId,
            status: params.status === 1 ? 'PAID' : params.status === -1 ? 'FAILED' : 'UNKNOWN',
            amount: params.amount,
            appid: params.appid,
            bankcode: params.bankcode,
            checksum: params.checksum,
            discountamount: params.discountamount,
            pmcid: params.pmcid,
            message: params.message,
          });
        } else {
          console.log('Missing appTransId in redirect params');
          Alert.alert('Lỗi', 'Không tìm thấy mã giao dịch');
          resetState();
        }
        return;
      }
    } catch (error) {
      console.error('Error in handleNavigationStateChange:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi xử lý redirect: ' + error.message);
      resetState();
    }
  };

  const injectedJavaScript = `
    (function() {
      try {
        const elementsToHide = document.querySelectorAll('header, nav, footer');
        elementsToHide.forEach(element => {
          if (element) element.style.display = 'none';
        });
        const mainContent = document.querySelector('body > div');
        if (mainContent) {
          mainContent.style.transform = 'scale(1)';
          mainContent.style.transformOrigin = 'top left';
          mainContent.style.width = '100%';
          mainContent.style.height = '100%';
        }
        const docsFooter = document.querySelector('.docs-footer');
        if (docsFooter) docsFooter.style.display = 'none';
      } catch (e) {
        console.log('Error in injected JavaScript:', e.message);
      }
      true;
    })();
  `;

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color="#00C4B4" />}

      {!paymentUrl ? (
        <PaymentButton onPress={handlePayment} disabled={isLoading} />
      ) : (
        <View style={styles.webviewWrapper}>
          <WebView
            source={{ uri: paymentUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onNavigationStateChange={handleNavigationStateChange}
            injectedJavaScript={injectedJavaScript}
            startInLoadingState={true}
            onShouldStartLoadWithRequest={(request) => {
              const { url } = request;
              console.log('onShouldStartLoadWithRequest - Request URL:', url);

              // Chỉ cho phép tải các URL của ZaloPay
              if (
                url.includes('zalopay.vn') ||
                url.includes('sandbox.zalopay.vn')
              ) {
                console.log('Allowing ZaloPay URL to load:', url);
                return true; // Cho phép tải
              }

              // Chặn tất cả các URL khác, xử lý trong onNavigationStateChange
              console.log('Blocking URL:', url);
              return false;
            }}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#00C4B4" />
                <Text style={styles.loadingText}>Đang kết nối đến ZaloPay...</Text>
              </View>
            )}
            onError={({ nativeEvent }) => {
              console.log('WebView Error:', nativeEvent);
              Alert.alert('Lỗi', 'Không thể tải trang thanh toán: ' + (nativeEvent.description || 'Không xác định'));
              resetState();
            }}
            onLoadStart={() => console.log('WebView loading started')}
            onLoadEnd={() => console.log('WebView loading finished')}
            androidLayerType="hardware"
          />

          <Button
            title="Hủy thanh toán"
            onPress={() => {
              Alert.alert(
                'Xác nhận',
                'Bạn có chắc muốn hủy thanh toán không?',
                [
                  { text: 'Không', style: 'cancel' },
                  { text: 'Có', onPress: resetState },
                ]
              );
            }}
            color="#FF3B30"
            style={styles.cancelButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  webviewWrapper: {
    flex: 1,
    marginTop: 20,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
  },
  cancelButton: {
    margin: 20,
  },
});

export default PaymentScreen;