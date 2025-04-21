import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

export const authenticateWithFirebase = async (idToken) => {
    return fetch(`${API_BASE_URL}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'tokenId': idToken }),
    });
};

export const registerDevice = async (deviceToken, deviceType) => {
    const jwtToken = await AsyncStorage.getItem('jwtToken');
    return axios.post(
        `${API_BASE_URL}/api/devices/register`,
        { deviceToken, deviceType },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
};

export const fetchNotifications = async (page = 0, size = 20) => {
    const jwtToken = await AsyncStorage.getItem('jwtToken');
    return axios.get(`${API_BASE_URL}/api/notifications/user`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
        params: { page, size },
    });
};