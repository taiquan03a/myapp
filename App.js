import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PaymentScreen from './screens/PaymentScreen';
import PaymentResultScreen from './screens/PaymentResultScreen';
import LoginScreen from './screens/LoginScreen';


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Payment">
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Thanh toán' }} />
        <Stack.Screen name="PaymentResultScreen" component={PaymentResultScreen} options={{ title: 'Kết quả thanh toán' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;