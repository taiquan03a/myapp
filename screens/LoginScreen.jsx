import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native';
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

    const CustomButton = ({ title, onPress, backgroundColor, textColor }) => (
        <TouchableOpacity
            style={[styles.button, { backgroundColor }]}
            onPress={onPress}
        >
            <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
        </TouchableOpacity>
    );

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
                navigation.navigate('Main', {
                    screen: 'Notifications',
                    params: { userId: data.userId }
                });
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
        <View style={styles.container}>
            {/* Button Group */}
            <CustomButton
                title="Đăng nhập bằng Email"
                onPress={() => setMethod('email')}
                backgroundColor="#007AFF"
                textColor="#FFFFFF"
            />
            <CustomButton
                title="Đăng nhập bằng Số điện thoại"
                onPress={() => setMethod('phone')}
                backgroundColor="#34C759"
                textColor="#FFFFFF"
            />
            <CustomButton
                title="Đăng nhập bằng Google"
                onPress={() => setMethod('google')}
                backgroundColor="#DB4437"
                textColor="#FFFFFF"
            />

            {/* Email Login Form */}
            {method === 'email' && (
                <View style={styles.formContainer}>
                    <TextInput
                        placeholder="Email"
                        onChangeText={setEmail}
                        value={email}
                        style={styles.textInput}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        placeholder="Mật khẩu"
                        secureTextEntry
                        onChangeText={setPassword}
                        value={password}
                        style={styles.textInput}
                    />
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: isSubmitting ? '#A0A0A0' : '#007AFF' },
                        ]}
                        onPress={handleEmailLogin}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Đang đăng nhập...' : 'Đang nhập'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            {method === 'phone' && <PhoneLoginScreen />}
            {method === 'google' && <GoogleLogin navigation={navigation} />}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    button: {
        paddingVertical: 12,
        borderRadius: 8,
        marginVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    formContainer: {
        marginTop: 20,
    },
    textInput: {
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        marginBottom: 15,
        paddingVertical: 8,
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
    },
    submitButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});