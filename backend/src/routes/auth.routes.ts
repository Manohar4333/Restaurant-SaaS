import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { loginSchema } from '../validators/auth.validator';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

export default router;
