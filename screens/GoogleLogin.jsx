import { useEffect } from "react";
import { Button, Alert } from "react-native";
import { getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { app } from "../config/firebaseConfig";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLogin() {
    const auth = getAuth(app);

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: "481411658885-nrvi6ms35aefa7pt9pg80hd1f2b3dsjc.apps.googleusercontent.com",
        redirectUri: "https://bookingapp-41256.firebaseapp.com/__/auth/handler",
        scopes: ["profile", "email"],
    });

    useEffect(() => {
        console.log("Google Auth Response:", response);
        if (response?.type === "success") {
            console.log("ID Token:", response.params.id_token);
            const { id_token } = response.params;
            if (id_token) {
                const credential = GoogleAuthProvider.credential(id_token);
                signInWithCredential(auth, credential)
                    .then((userCredential) => {
                        Alert.alert("Đăng nhập thành công!", `Xin chào ${userCredential.user.displayName}`);
                    })
                    .catch((error) => {
                        console.error("Lỗi đăng nhập Google:", error);
                        Alert.alert("Đăng nhập thất bại", error.message);
                    });
            } else {
                console.error("Lỗi: Không nhận được ID Token!");
            }
        }
    }, [response]);



    return (
        <Button title="Đăng nhập Google" disabled={!request} onPress={() => promptAsync()} />
    );
}
