import { NativeModules, NativeEventEmitter } from 'react-native';

const { ZaloPaySDK } = NativeModules;

export default {
  ...ZaloPaySDK,
  getEmitter: () => new NativeEventEmitter(ZaloPaySDK),
};