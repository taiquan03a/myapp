#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(ZaloPaySDK, RCTEventEmitter)

RCT_EXTERN_METHOD(initWithAppId:(NSString *)appId
                  uriScheme:(NSString *)uriScheme
                  environment:(NSString *)environment
                  callback:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(payOrder:(NSString *)zpTransToken
                  callback:(RCTResponseSenderBlock)callback)

@end