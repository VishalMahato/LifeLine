import { Router } from 'express';
import AuthController from './Auth.controller.mjs';
import { validateAuthPayload } from './Auth.utils.mjs';

const authRouter = Router();
const authController = new AuthController();

authRouter.post('/signup', validateAuthPayload, authController.signUp);
authRouter.post('/login', validateAuthPayload, authController.login);

export default authRouter;
