// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
    getAuth,
    initializeAuth,
    getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const firebaseConfig = {
    apiKey: "AIzaSyDov39GmGsOPVTvHsliAGcqbsxEBgqo_PA",
    authDomain: "bookingapp-41256.firebaseapp.com",
    projectId: "bookingapp-41256",
    storageBucket: "bookingapp-41256.firebasestorage.app",
    messagingSenderId: "481411658885",
    appId: "1:481411658885:web:fc89d0a3dfa60a5af5e5ec",
    measurementId: "G-VDKRWHQE5C"
};

let app;
if (!Constants.manifest?.extra?.firebaseConfig) {
    app = initializeApp(firebaseConfig);
} else {
    app = initializeApp(Constants.manifest.extra.firebaseConfig);
}

// Khởi tạo Auth với AsyncStorage
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});
auth.useDeviceLanguage();

export { app, auth };
