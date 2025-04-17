import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useWebSocket } from '../hooks/useWebSocket';
import { fetchNotifications } from '../api/api';
import NotificationItem from '../components/NotificationItem';
import styles from '../styles/notificationStyles';

const NotificationScreen = ({ route }) => {
    const { userId } = route.params;
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy danh sách thông báo từ API
    const fetchNotificationsData = async () => {
        try {
            const response = await fetchNotifications(userId);
            setNotifications(response.data);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải thông báo: ' + error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Kết nối WebSocket
    useWebSocket(userId, (notification) => {
        setNotifications((prev) => [
            { id: Date.now(), ...notification, createdAt: new Date().toISOString() },
            ...prev,
        ]);
        Alert.alert(notification.title, notification.message);
    });

    // Xử lý thông báo từ expo-notifications
    useEffect(() => {
        const subscription = Notifications.addNotificationReceivedListener((notification) => {
            const { title, body } = notification.request.content;
            setNotifications((prev) => [
                {
                    id: Date.now(),
                    title,
                    message: body,
                    createdAt: new Date().toISOString(),
                },
                ...prev,
            ]);
            Alert.alert(title, body);
        });

        Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('Notification response:', response);
        });

        return () => subscription.remove();
    }, []);

    // Gọi API khi màn hình được mount
    useEffect(() => {
        fetchNotificationsData();
    }, [userId]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Danh sách thông báo</Text>
            {loading ? (
                <Text>Đang tải...</Text>
            ) : notifications.length === 0 ? (
                <Text>Không có thông báo nào.</Text>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={({ item }) => <NotificationItem item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                />
            )}
        </View>
    );
};

export default NotificationScreen;