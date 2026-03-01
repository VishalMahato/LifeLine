import express from 'express';
import NGOController from './NGO.controller.mjs';
import AuthMiddleware from '../Auth/v1/Auth.middleware.mjs';

const router = express.Router();

router.post('/:id/payments', AuthMiddleware.authenticate, NGOController.createPayment);
router.get('/:id/payments', AuthMiddleware.authenticate, NGOController.getPayments);
router.patch(
  '/payments/:paymentId/status',
  AuthMiddleware.authenticate,
  NGOController.updatePaymentStatus,
);

// Public routes
router.post('/register', NGOController.register);
router.get('/nearby', NGOController.getNearby);

// Protected routes (admin-only management)
router.use(AuthMiddleware.authenticate);
router.get('/', NGOController.getAll);
router.patch('/:id/status', AuthMiddleware.authorize(['admin']), NGOController.updateStatus);
router.delete('/:id', AuthMiddleware.authorize(['admin']), NGOController.deleteNGO);

export default router;
