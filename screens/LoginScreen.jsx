import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import GoogleLogin from "./GoogleLogin";
import PhoneLoginScreen from "./PhoneLoginScreen";

export default function LoginScreen() {
    const [method, setMethod] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const auth = getAuth();

    // Gửi ID Token lên backend
    const sendTokenToBackend = async (idToken) => {
        try {
            const response = await fetch("http://10.0.2.2:9090/api/auth/firebase", {
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
            Alert.alert("Lỗi gửi token!", error.message);
            console.log(error);
        }
    };

    // Xử lý đăng nhập bằng Email/Password
    const handleEmailLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken(); // Lấy ID Token từ Firebase
            console.log("idToken->", idToken);
            sendTokenToBackend(idToken);
        } catch (error) {
            Alert.alert("Lỗi đăng nhập", error.message);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                Chọn phương thức đăng nhập
            </Text>

            {/* Chọn phương thức đăng nhập */}
            <Button title="Đăng nhập bằng Email" onPress={() => setMethod("email")} />
            <Button title="Đăng nhập bằng Số điện thoại" onPress={() => setMethod("phone")} />
            <Button title="Đăng nhập bằng Google" onPress={() => setMethod("google")} />

            {/* Form đăng nhập Email */}
            {method === "email" && (
                <View>
                    <TextInput
                        placeholder="Email"
                        onChangeText={setEmail}
                        value={email}
                        style={{ borderBottomWidth: 1, marginBottom: 10 }}
                    />
                    <TextInput
                        placeholder="Mật khẩu"
                        secureTextEntry
                        onChangeText={setPassword}
                        value={password}
                        style={{ borderBottomWidth: 1, marginBottom: 10 }}
                    />
                    <Button title="Đăng nhập" onPress={handleEmailLogin} />
                </View>
            )}

            {/* Đăng nhập bằng số điện thoại */}
            {method === "phone" && <PhoneLoginScreen />}

            {/* Đăng nhập bằng Google */}
            {method === "google" && <GoogleLogin />}
        </View>
    );
}
