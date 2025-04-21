import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/notificationStyles'; // Tách styles để tái sử dụng

const formatDate = (dateArray) => {
    console.log('dateArray', dateArray);
    const date = new Date(
        dateArray[0],
        dateArray[1] - 1,
        dateArray[2],
        dateArray[3],
        dateArray[4],
        dateArray[5]
    );

    const pad = (n) => n.toString().padStart(2, '0');

    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const NotificationItem = ({ item }) => (
    <View style={[styles.notificationItem, !item.isRead && styles.unread]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
    </View>
);

export default React.memo(NotificationItem);