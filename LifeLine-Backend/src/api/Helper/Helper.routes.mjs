import { Router } from 'express';
import HelperController from './Helper.controller.mjs';
import { sanitizeAvailability, validateHelperIdParam } from './Helper.utils.mjs';

const helperRouter = Router();
const helperController = new HelperController();

helperRouter.post('/', helperController.createProfile);
helperRouter.get('/:helperId', validateHelperIdParam, helperController.getProfileById);
helperRouter.patch(
  '/:helperId/availability',
  validateHelperIdParam,
  sanitizeAvailability,
  helperController.updateAvailability,
);

export default helperRouter;
