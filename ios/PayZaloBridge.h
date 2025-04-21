//
//  PayZaloBridge.h
//  EsaleMobile
//
//  Created by Mr. Jery on 7/25/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

const NSInteger PAYMENTSUCCESS = 1;
const NSInteger PAYMENTFAILED = -1;
const NSInteger PAYMENTCANCELED = 4;

@interface PayZaloBridge : RCTEventEmitter<RCTBridgeModule>

@end
