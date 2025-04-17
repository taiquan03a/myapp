import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ZaloPaySDK from 'zalopay-sdk';
import { ZALOPAY_CONFIG } from '../config/zalopay';
import { PaymentService } from '../services/PaymentService';

export const useZaloPay = () => {
    const [loading, setLoading] = useState(false);
    const [isZaloPayInstalled, setIsZaloPayInstalled] = useState(null);

    const checkZaloPayInstalled = useCallback(async () => {
        try {
            const canOpen = await Linking.canOpenURL('zalopay://');
            setIsZaloPayInstalled(canOpen);
            return canOpen;
        } catch (error) {
            setIsZaloPayInstalled(false);
            return false;
        }
    }, []);

    const initializeZaloPay = useCallback(async () => {
        try {
            await new Promise((resolve, reject) => {
                ZaloPaySDK.initWithAppId(
                    ZALOPAY_CONFIG.APP_ID,
                    ZALOPAY_CONFIG.URI_SCHEME,
                    ZALOPAY_CONFIG.ENVIRONMENT,
                    (error, result) => {
                        if (error) reject(new Error(error));
                        else resolve(result);
                    }
                );
            });
            console.log('ZaloPay SDK initialized');
        } catch (error) {
            throw new Error(`ZaloPay init failed: ${error.message}`);
        }
    }, []);

    const payWithZaloPay = useCallback(async (orderId, amount) => {
        setLoading(true);
        try {
            const isInstalled = await checkZaloPayInstalled();
            if (!isInstalled) {
                throw new Error('ZaloPay app is not installed. Please install it.');
            }

            await initializeZaloPay();
            const { zpTransToken, appTransId } = await PaymentService.createOrder(orderId, amount);
            await AsyncStorage.setItem('lastAppTransId', appTransId);

            const result = await new Promise((resolve, reject) => {
                ZaloPaySDK.payOrder(zpTransToken, (error, errorCode, message) => {
                    if (error) reject(new Error(error));
                    resolve({ errorCode: parseInt(errorCode), message, appTransId });
                });
            });

            return result;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, [checkZaloPayInstalled, initializeZaloPay]);

    const setupZaloPayListener = useCallback((onResult) => {
        const emitter = ZaloPaySDK.getEmitter();
        const listener = emitter.addListener('ZaloPayEvent', (event) => {
            onResult(event);
        });
        return () => listener.remove();
    }, []);

    return {
        payWithZaloPay,
        checkOrderStatus: PaymentService.checkOrderStatus,
        setupZaloPayListener,
        loading,
        isZaloPayInstalled,
    };
};