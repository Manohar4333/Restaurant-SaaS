"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_controller_1 = require("../controllers/public.controller");
const router = (0, express_1.Router)();
// Public restaurant menu endpoints (no auth required)
router.get('/restaurants/:slug', public_controller_1.PublicController.getRestaurantBySlug);
router.get('/restaurants/:slug/categories', public_controller_1.PublicController.getCategories);
router.get('/restaurants/:slug/products', public_controller_1.PublicController.getProducts);
router.get('/restaurants/:slug/products/:id', public_controller_1.PublicController.getProductDetails);
router.get('/restaurants/:slug/tables/:qrToken', public_controller_1.PublicController.getTableByToken);
exports.default = router;
