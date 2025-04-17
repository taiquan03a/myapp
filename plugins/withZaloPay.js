const { withPlugins, createRunOncePlugin } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withZaloPay = (config) => {
    // Thêm ZaloPay SDK vào iOS
    config = withPlugins(config, [
        [
            '@expo/config-plugins/ios',
            {
                modifyPodfile: ({ podfile }) => {
                    podfile += `
            pod 'ZaloPaySDK', :path => '../node_modules/zalopay-sdk-ios'
          `;
                    return podfile;
                },
                infoPlist: {
                    LSApplicationQueriesSchemes: ['zalopay', 'zalo', 'zalopay.api.v2'],
                    CFBundleURLTypes: [
                        {
                            CFBundleTypeRole: 'Editor',
                            CFBundleURLName: 'com.yourapp.zalopay',
                            CFBundleURLSchemes: ['yourappscheme'],
                        },
                    ],
                },
            },
        ],
        [
            '@expo/config-plugins/android',
            {
                modifyAndroidManifest: ({ manifest }) => {
                    const mainActivity = manifest.manifest.application[0].activity.find(
                        (act) => act['$']['android:name'] === '.MainActivity'
                    );
                    if (mainActivity) {
                        mainActivity['intent-filter'] = mainActivity['intent-filter'] || [];
                        mainActivity['intent-filter'].push({
                            $: { 'android:autoVerify': 'true' },
                            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
                            category: [
                                { $: { 'android:name': 'android.intent.category.DEFAULT' } },
                                { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
                            ],
                            data: [{ $: { 'android:scheme': 'yourappscheme' } }],
                        });
                    }
                    return manifest;
                },
                modifyAppBuildGradle: ({ gradle }) => {
                    gradle += `
            dependencies {
              implementation files('libs/zalopay-sdk.aar')
            }
          `;
                    return gradle;
                },
            },
        ],
    ]);
    // Copy ZaloPay SDK
    config.ios = config.ios || {};
    config.ios.extraPods = [
        {
            name: 'ZaloPaySDK',
            path: '../ios/libs/ZaloPaySDK.framework',
        },
    ];

    config.android = config.android || {};
    config.android.extraFiles = [
        {
            source: 'android/libs/zalopay-sdk.aar',
            destination: 'libs/zalopay-sdk.aar',
        },
    ];

    return config;
};

module.exports = createRunOncePlugin(withZaloPay, 'withZaloPay', '1.0.0');