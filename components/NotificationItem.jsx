import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/notificationStyles'; // Tách styles để tái sử dụng

const NotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleString()}
        </Text>
    </View>
);

export default React.memo(NotificationItem);