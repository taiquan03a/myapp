import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Linking from 'expo-linking';

import PaymentScreen from './screens/PaymentScreen';
import PaymentResultScreen from './screens/PaymentResultScreen';
import LoginScreen from './screens/LoginScreen';
import NotificationScreen from './screens/NotificationScreen';
import PaymentWebViewScreen from './screens/PaymentWebViewScreen';

const linking = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      PaymentResultScreen: 'payment-result',
    },
  },
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Tab gồm Payment và Notification
const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Payment" component={PaymentScreen} options={{ title: 'Thanh toán' }} />
    <Tab.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Thông báo' }} />
  </Tab.Navigator>
);

// ✅ Stack chính
const App = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentResultScreen" component={PaymentResultScreen} options={{ title: 'Kết quả thanh toán' }} />
        <Stack.Screen name="PaymentWebViewScreen" component={PaymentWebViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
