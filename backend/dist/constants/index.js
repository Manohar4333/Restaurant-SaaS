"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.ProductAvailability = exports.TableStatus = exports.OrderPaymentMethod = exports.OrderPaymentStatus = exports.OrderStatus = exports.PaymentProvider = exports.PaymentStatus = exports.SubscriptionStatus = exports.BillingCycle = exports.TenantStatus = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["CUSTOMER"] = "CUSTOMER";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "ACTIVE";
    TenantStatus["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    TenantStatus["SUSPENDED"] = "SUSPENDED";
    TenantStatus["DEACTIVATED"] = "DEACTIVATED";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
var BillingCycle;
(function (BillingCycle) {
    BillingCycle["MONTHLY"] = "MONTHLY";
    BillingCycle["QUARTERLY"] = "QUARTERLY";
    BillingCycle["YEARLY"] = "YEARLY";
})(BillingCycle || (exports.BillingCycle = BillingCycle = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    SubscriptionStatus["GRACE_PERIOD"] = "GRACE_PERIOD";
    SubscriptionStatus["EXPIRED"] = "EXPIRED";
    SubscriptionStatus["SUSPENDED"] = "SUSPENDED";
    SubscriptionStatus["CANCELLED"] = "CANCELLED";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["CREATED"] = "CREATED";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["RAZORPAY"] = "RAZORPAY";
    PaymentProvider["STRIPE"] = "STRIPE";
    PaymentProvider["OFFLINE"] = "OFFLINE";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["NEW"] = "NEW";
    OrderStatus["ACCEPTED"] = "ACCEPTED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY"] = "READY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["REJECTED"] = "REJECTED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderPaymentStatus;
(function (OrderPaymentStatus) {
    OrderPaymentStatus["PENDING"] = "PENDING";
    OrderPaymentStatus["PAID"] = "PAID";
    OrderPaymentStatus["FAILED"] = "FAILED";
})(OrderPaymentStatus || (exports.OrderPaymentStatus = OrderPaymentStatus = {}));
var OrderPaymentMethod;
(function (OrderPaymentMethod) {
    OrderPaymentMethod["PAY_AT_RESTAURANT"] = "PAY_AT_RESTAURANT";
    OrderPaymentMethod["ONLINE"] = "ONLINE";
})(OrderPaymentMethod || (exports.OrderPaymentMethod = OrderPaymentMethod = {}));
var TableStatus;
(function (TableStatus) {
    TableStatus["AVAILABLE"] = "AVAILABLE";
    TableStatus["OCCUPIED"] = "OCCUPIED";
    TableStatus["ORDER_PLACED"] = "ORDER_PLACED";
    TableStatus["SERVING"] = "SERVING";
    TableStatus["CLEANING"] = "CLEANING";
})(TableStatus || (exports.TableStatus = TableStatus = {}));
var ProductAvailability;
(function (ProductAvailability) {
    ProductAvailability["AVAILABLE"] = "AVAILABLE";
    ProductAvailability["UNAVAILABLE"] = "UNAVAILABLE";
})(ProductAvailability || (exports.ProductAvailability = ProductAvailability = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["NEW_ORDER"] = "NEW_ORDER";
    NotificationType["ORDER_ACCEPTED"] = "ORDER_ACCEPTED";
    NotificationType["ORDER_REJECTED"] = "ORDER_REJECTED";
    NotificationType["ORDER_PREPARING"] = "ORDER_PREPARING";
    NotificationType["ORDER_READY"] = "ORDER_READY";
    NotificationType["ORDER_DELIVERED"] = "ORDER_DELIVERED";
    NotificationType["ORDER_COMPLETED"] = "ORDER_COMPLETED";
    NotificationType["SUBSCRIPTION_EXPIRING"] = "SUBSCRIPTION_EXPIRING";
    NotificationType["PAYMENT_SUCCESS"] = "PAYMENT_SUCCESS";
    NotificationType["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    NotificationType["ACCOUNT_SUSPENDED"] = "ACCOUNT_SUSPENDED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
