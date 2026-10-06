"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const validateRequest_1 = require("../middlewares/validateRequest");
const order_validator_1 = require("../validators/order.validator");
const router = (0, express_1.Router)();
// Order creation from customer mobile menu
router.post('/', (0, validateRequest_1.validateRequest)(order_validator_1.createOrderSchema), order_controller_1.OrderController.createOrder);
// Tracking specific order
router.get('/:id', order_controller_1.OrderController.getOrderById);
// Customer order history by phone
router.get('/my-orders', order_controller_1.OrderController.getCustomerOrders);
// Cancel order before acceptance
router.post('/:id/cancel', order_controller_1.OrderController.cancelOrder);
exports.default = router;
