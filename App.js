import React, { useEffect, useRef } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';

import PaymentScreen from './screens/PaymentScreen';
import PaymentResultScreen from './screens/PaymentResultScreen';
import LoginScreen from './screens/LoginScreen';
import NotificationScreen from './screens/NotificationScreen';
import PaymentWebViewScreen from './screens/PaymentWebViewScreen';

// 👇 Thêm màn hình test
import TestScreen from './screens/TestScreen';

const linking = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      PaymentResultScreen: 'payment-result',
    },
  },
};

// ✅ Cấu hình hiện thông báo hệ thống
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Payment" component={PaymentScreen} options={{ title: 'Thanh toán' }} />
    <Tab.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Thông báo' }} />
  </Tab.Navigator>
);

const App = () => {
  const navigationRef = useNavigationContainerRef();
  const responseListener = useRef();

  // 👇 Lắng nghe khi người dùng bấm vào thông báo
  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification response:', data);
      if (data?.navigateTo === 'TestScreen') {
        navigationRef.current?.navigate('TestScreen');
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentResultScreen" component={PaymentResultScreen} options={{ title: 'Kết quả thanh toán' }} />
        <Stack.Screen name="PaymentWebViewScreen" component={PaymentWebViewScreen} />
        <Stack.Screen name="TestScreen" component={TestScreen} options={{ title: 'Màn hình Test' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
