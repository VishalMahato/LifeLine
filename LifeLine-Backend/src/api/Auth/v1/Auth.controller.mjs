import AuthService from './Auth.service.mjs';

const authService = new AuthService();

class AuthController {
  login = async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  signUp = async (req, res, next) => {
    try {
      const result = await authService.signUp(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
