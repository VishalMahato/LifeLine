import mongoose from 'mongoose';

const validateHelperIdParam = (req, res, next) => {
  const { helperId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(helperId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid helperId',
    });
  }

  return next();
};

const sanitizeAvailability = (req, res, next) => {
  const { availability } = req.body ?? {};

  if (availability && typeof availability !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'availability must be an object',
    });
  }

  return next();
};

export { sanitizeAvailability, validateHelperIdParam };
