import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';

export const useWebSocket = (userId, onMessageReceived) => {
    useEffect(() => {
        // Tạo WebSocket client với @stomp/stompjs
        const client = new Client({
            brokerURL: 'ws://10.0.2.2:9090/ws',
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            webSocketFactory: () => new WebSocket('ws://10.0.2.2:9090/ws'),
        });

        client.onConnect = () => {
            client.subscribe(`/topic/notifications/${userId}`, (message) => {
                const notification = JSON.parse(message.body);
                onMessageReceived(notification);
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP error:', frame);
        };

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [userId, onMessageReceived]);
};