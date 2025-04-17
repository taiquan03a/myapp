package com.zalopaysdk;

import android.app.Activity;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.zalopay.sdk.ZaloPaySDK;

public class ZaloPayModule extends ReactContextBaseJavaModule {
    private static final String TAG = "ZaloPayModule";

    public ZaloPayModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "ZaloPaySDK";
    }

    @ReactMethod
    public void initWithAppId(String appId, String uriScheme, String environment, Callback callback) {
        try {
            ZaloPaySDK.init(appId, uriScheme, environment.equals("SANDBOX") ? ZaloPaySDK.ENV_SANDBOX : ZaloPaySDK.ENV_PRODUCTION);
            Log.d(TAG, "ZaloPay SDK initialized");
            callback.invoke(null, "Initialized");
        } catch (Exception e) {
            Log.e(TAG, "Init failed: " + e.getMessage());
            callback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void payOrder(String zpTransToken, Callback callback) {
        try {
            Activity activity = getCurrentActivity();
            if (activity == null) {
                callback.invoke("No activity available", null);
                return;
            }
            ZaloPaySDK.getInstance().payOrder(activity, zpTransToken, new ZaloPaySDK.OnResultListener() {
                @Override
                public void onResult(int errorCode, String message) {
                    Log.d(TAG, "Pay result: errorCode=" + errorCode + ", message=" + message);
                    callback.invoke(null, errorCode, message);
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Pay failed: " + e.getMessage());
            callback.invoke(e.getMessage(), null);
        }
    }
}