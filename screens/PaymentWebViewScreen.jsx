import React, { useRef, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

const PaymentWebViewScreen = ({ navigation, route }) => {
    const { orderUrl } = route.params;
    const [loading, setLoading] = useState(true);

    const handleNavigationStateChange = (navState) => {
        const { url } = navState;

        if (url.startsWith('myapp://payment-result')) {
            // Chặn mở URL ngoài WebView
            console.log('Redirect URL detected: ', url);
            const params = new URLSearchParams(url.split('?')[1]);

            const status = params.get('status');
            const appTransId = params.get('apptransid');
            const amount = params.get('amount');
            const message = params.get('message') || '';

            navigation.replace('PaymentResultScreen', {
                appTransId,
                status: status === '1' ? 'PAID' : 'FAILED',
                amount,
                message,
            });
        }
    };

    const handleShouldStartLoadWithRequest = (request) => {
        const { url } = request;

        // Kiểm tra URL trước khi mở
        if (url.startsWith('myapp://')) {
            // Nếu là custom scheme, chặn WebView mở
            console.log('Blocking custom URL:', url);
            console.log('Redirect URL detected: ', url);
            const params = new URLSearchParams(url.split('?')[1]);

            const status = params.get('status');
            const appTransId = params.get('apptransid');
            const amount = params.get('amount');
            const message = params.get('message') || '';

            navigation.replace('PaymentResultScreen', {
                appTransId,
                status: status === '1' ? 'PAID' : 'FAILED',
                amount,
                message,
            });
            return false;  // Chặn URL mở trong WebView
        }

        return true;  // Tiếp tục mở URL trong WebView nếu không phải custom scheme
    };

    return (
        <View style={{ flex: 1 }}>
            {loading && <ActivityIndicator size="large" color="#00C4B4" />}
            <WebView
                source={{ uri: orderUrl }}
                onNavigationStateChange={handleNavigationStateChange}
                onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}  // Kiểm tra URL trước khi mở
                startInLoadingState
                onLoadEnd={() => setLoading(false)}  // Dừng loading khi WebView tải xong
                originWhitelist={['*']}
            />
        </View>
    );
};

export default PaymentWebViewScreen;
