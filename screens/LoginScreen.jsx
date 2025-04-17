import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Platform } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { authenticateWithFirebase, registerDevice } from '../api/api';
import GoogleLogin from './GoogleLogin';
import PhoneLoginScreen from './PhoneLoginScreen';

export default function LoginScreen({ navigation }) {
    const [method, setMethod] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái gửi yêu cầu
    const auth = getAuth();

    const sendTokenToBackend = async (idToken) => {
        try {
            const response = await authenticateWithFirebase(idToken);
            const data = await response.json();
            console.log('Access Token:', data.data.accessToken);
            if (data.data.accessToken) {
                await AsyncStorage.setItem('jwtToken', data.data.accessToken);
                // await AsyncStorage.setItem('userId', data.userId.toString());

                const deviceToken = await registerForPushNotificationsAsync();
                console.log('Device os:', Platform.OS);
                if (deviceToken) {
                    await registerDevice(
                        deviceToken,
                        Platform.OS === 'ios' ? 'IOS' : 'ANDROID'
                    );
                }

                Alert.alert('Đăng nhập thành công!');
                navigation.navigate('Notifications', { userId: data.userId });
            } else {
                Alert.alert('Lỗi xác thực với backend!');
            }
        } catch (error) {
            Alert.alert('Lỗi gửi token!', error.message);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailLogin = async () => {
        if (isSubmitting) {
            Alert.alert('Đang xử lý', 'Vui lòng đợi giây lát!');
            return;
        }

        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu!');
            return;
        }

        setIsSubmitting(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            console.log('ID Token:', idToken);
            sendTokenToBackend(idToken);
        } catch (error) {
            if (error.code === 'auth/quota-exceeded') {
                Alert.alert(
                    'Lỗi',
                    'Đã vượt quá số lần thử đăng nhập. Vui lòng thử lại sau 10 phút.'
                );
            } else {
                Alert.alert('Lỗi đăng nhập', error.message);
            }
            setIsSubmitting(false);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
                Chọn phương thức đăng nhập
            </Text>

            <Button title="Đăng nhập bằng Email" onPress={() => setMethod('email')} />
            <Button title="Đăng nhập bằng Số điện thoại" onPress={() => setMethod('phone')} />
            <Button title="Đăng nhập bằng Google" onPress={() => setMethod('google')} />

            {method === 'email' && (
                <View>
                    <TextInput
                        placeholder="Email"
                        onChangeText={setEmail}
                        value={email}
                        style={{ borderBottomWidth: 1, marginBottom: 10 }}
                        autoCapitalize="none"
                    />
                    <TextInput
                        placeholder="Mật khẩu"
                        secureTextEntry
                        onChangeText={setPassword}
                        value={password}
                        style={{ borderBottomWidth: 1, marginBottom: 10 }}
                    />
                    <Button
                        title={isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        onPress={handleEmailLogin}
                        disabled={isSubmitting}
                    />
                </View>
            )}

            {method === 'phone' && <PhoneLoginScreen />}
            {method === 'google' && <GoogleLogin navigation={navigation} />}
        </View>
    );
}