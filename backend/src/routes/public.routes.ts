import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';

const router = Router();

// Public restaurant menu endpoints (no auth required)
router.get('/restaurants/:slug', PublicController.getRestaurantBySlug);
router.get('/restaurants/:slug/categories', PublicController.getCategories);
router.get('/restaurants/:slug/products', PublicController.getProducts);
router.get('/restaurants/:slug/products/:id', PublicController.getProductDetails);
router.get('/restaurants/:slug/tables/:qrToken', PublicController.getTableByToken);

export default router;
