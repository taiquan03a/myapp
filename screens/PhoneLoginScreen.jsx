import React, { useState, useRef } from "react";
import { View, TextInput, Button, Alert, Text } from "react-native";
import { getAuth, signInWithPhoneNumber } from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { app } from "../config/firebaseConfig"; // Import app từ firebaseConfig.js

const auth = getAuth(app);

const PhoneAuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState("");
  const recaptchaVerifier = useRef(null);

  // Gửi OTP
  const sendOTP = async () => {
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current);
      setConfirm(confirmation);
      Alert.alert("OTP đã được gửi!");
    } catch (error) {
      Alert.alert("Lỗi gửi OTP: " + error.message);
    }
  };

  // Xác thực OTP và gửi ID Token đến backend
  const verifyOTP = async () => {
    try {
      const userCredential = await confirm.confirm(code);
      const idToken = await userCredential.user.getIdToken(); // Lấy ID Token từ Firebase

      // Gửi ID Token đến backend để xác thực
      const response = await fetch("http://localhost/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      if (data.jwtToken) {
        Alert.alert("Đăng nhập thành công!", `JWT: ${data.jwtToken}`);
      } else {
        Alert.alert("Lỗi xác thực với backend!");
      }
    } catch (error) {
      Alert.alert("OTP không đúng, thử lại!");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
      />

      {!confirm ? (
        <>
          <Text>Nhập số điện thoại:</Text>
          <TextInput
            placeholder="+84..."
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          />
          <Button title="Gửi OTP" onPress={sendOTP} />
        </>
      ) : (
        <>
          <Text>Nhập OTP:</Text>
          <TextInput
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          />
          <Button title="Xác nhận OTP" onPress={verifyOTP} />
        </>
      )}
    </View>
  );
};

export default PhoneAuthScreen;
