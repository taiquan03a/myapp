import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
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
            const response = await fetchNotifications();
            console.log('Thông báo:', response.data);
            setNotifications(response.data);
        } catch (error) {
            console.error('Không thể tải thông báo:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Lắng nghe notification từ Expo (push/local)
    useEffect(() => {
        const subscription = Notifications.addNotificationReceivedListener((notification) => {
            const { title, body } = notification.request.content;
            const newNoti = {
                id: Date.now(),
                title,
                message: body,
                createdAt: new Date().toISOString(),
            };
            setNotifications((prev) => [newNoti, ...prev]);
        });

        const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('Notification response:', response);
        });

        return () => {
            subscription.remove();
            responseSubscription.remove();
        };
    }, []);

    // Nhận dữ liệu từ WebSocket và hiển thị banner
    useWebSocket(userId, (notification) => {
        const newNoti = {
            id: Date.now(),
            ...notification,
            createdAt: new Date().toISOString(),
        };

        setNotifications((prev) => [newNoti, ...prev]);

        Notifications.scheduleNotificationAsync({
            content: {
                title: notification.title,
                body: notification.message,
            },
            trigger: null, // gửi ngay lập tức
        });
    });

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
