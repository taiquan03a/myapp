//
//  PayZaloBridge.m
//  ZaloPay
//
//  Created by Luu Duc Hoang on 02/06/21.
//  Copyright © 2021 ZaloPay. All rights reserved.
//

#import "PayZaloBridge.h"
#import <zpdk/zpdk.h>

@interface PayZaloBridge () <ZPPaymentDelegate>

@end

@implementation PayZaloBridge

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"EventPayZalo"];
}

RCT_EXPORT_METHOD(payOrder:
                  (NSString *)zpTransToken) {
  [ZaloPaySDK sharedInstance].paymentDelegate = self;
  [[ZaloPaySDK sharedInstance] payOrder:zpTransToken];
}

RCT_EXPORT_METHOD(installApp) {
  [[ZaloPaySDK sharedInstance] navigateToZaloStore]; // Use for Production
  //for the sandbox
  //   NSURL* url = [[NSURL alloc] initWithString:@"https://stcstg.zalopay.com.vn/ps_res/ios/enterprise/sandboxmer/4.22.0/install.html"];
  //            [[UIApplication sharedApplication] openURL: url];
}

- (void)paymentDidSucceeded:(NSString *)transactionId
                 zpTranstoken:(NSString *)zpTranstoken
                   appTransId:(NSString *)appTransId {
    [self sendEventWithName:@"EventPayZalo" body:@{@"returnCode": [NSString stringWithFormat:@"%ld", (long)1], @"transactionId":transactionId ? transactionId : @"", @"zpTranstoken": zpTranstoken ? zpTranstoken : @"", @"appTransId": appTransId ? appTransId : @""}];
}

- (void)paymentDidCanceled:(NSString *)zpTranstoken
                appTransId:(NSString *)appTransId {
    [self sendEventWithName:@"EventPayZalo" body:@{@"returnCode": [NSString stringWithFormat:@"%ld", (long)-4], @"zpTranstoken":zpTranstoken ? zpTranstoken : @"", @"appTransId": appTransId ? appTransId : @""}];
}

- (void)paymentDidError:(ZPPaymentErrorCode)errorCode
           zpTranstoken:(NSString *)zpTranstoken
             appTransId:(NSString *)appTransId {
  // Handle Error
  if (errorCode == ZPPaymentErrorCode_AppNotInstall) {
     [[ZaloPaySDK sharedInstance] navigateToZaloStore];
     return;
   }
  
  [self sendEventWithName:@"EventPayZalo" body:@{@"returnCode": [NSString stringWithFormat:@"%ld", (long)errorCode], @"zpTranstoken":zpTranstoken ? zpTranstoken : @"", @"appTransId":appTransId ? appTransId : @""}];
}
@end
