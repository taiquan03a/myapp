import Foundation
import ZaloPaySDK

@objc(ZaloPaySDK)
class ZaloPaySDK: RCTEventEmitter {
    override func supportedEvents() -> [String]! {
        return ["ZaloPayEvent"]
    }

    @objc
    func initWithAppId(_ appId: String, uriScheme: String, environment: String, callback: RCTResponseSenderBlock) {
        ZaloPaySDK.shared().init(withAppId: appId, uriScheme: uriScheme, environment: environment == "SANDBOX" ? .sandbox : .production)
        callback([nil, "Initialized"])
    }

    @objc
    func payOrder(_ zpTransToken: String, callback: RCTResponseSenderBlock) {
        ZaloPaySDK.shared().payOrder(zpTransToken) { errorCode, message in
            callback([nil, NSNumber(value: errorCode), message ?? ""])
            self.sendEvent(withName: "ZaloPayEvent", body: [
                "errorCode": errorCode,
                "message": message ?? ""
            ])
        }
    }
}