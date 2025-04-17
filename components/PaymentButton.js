import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const PaymentButton = ({ onPress, title = 'Thanh toán với ZaloPay', disabled }) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.disabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#00C4B4',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabled: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PaymentButton;