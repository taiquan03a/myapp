import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    notificationItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
    },
    title: { fontSize: 16, fontWeight: 'bold' },
    message: { fontSize: 14, color: '#333' },
    date: { fontSize: 12, color: '#666' },
});

export default styles;