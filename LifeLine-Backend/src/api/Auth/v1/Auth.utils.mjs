const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?\d{8,15}$/;

const isEmail = (value = '') => emailRegex.test(String(value).trim());

const normalizePhoneNumber = (value = '') => String(value).replace(/[^\d+]/g, '');

const isPhoneNumber = (value = '') => phoneRegex.test(normalizePhoneNumber(value));

const validateAuthPayload = (req, res, next) => {
  const { email, phoneNumber } = req.body ?? {};

  if (!email && !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'Provide either email or phoneNumber',
    });
  }

  if (email && !isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  if (phoneNumber && !isPhoneNumber(phoneNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format',
    });
  }

  if (phoneNumber) {
    req.body.phoneNumber = normalizePhoneNumber(phoneNumber);
  }

  return next();
};

export { isEmail, isPhoneNumber, normalizePhoneNumber, validateAuthPayload };
