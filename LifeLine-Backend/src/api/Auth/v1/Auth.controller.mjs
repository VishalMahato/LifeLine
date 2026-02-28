import AuthService from './Auth.service.mjs';
import AuthUtils from './Auth.utils.mjs';
import AuthConstants from './Auth.constants.mjs';

/**
 * AuthController - API controllers for authentication endpoints
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
class AuthController {
  /**
   * Handle signup step 1 - Create auth record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async signupStep1(req, res) {
    try {
      const authData = { ...req.body };
      if (req.file?.path) {
        authData.profileImage = req.file.path;
      }
      const result = await AuthService.createAuth(authData);

      const response = AuthUtils.createSuccessResponse(
        'Auth record created successfully',
        { authId: result._id },
        AuthConstants.HTTP_STATUS.CREATED,
      );

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Check if email exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async checkEmail(req, res) {
    try {
      const { email } = req.params;
      const result = await AuthService.checkEmailExists(email);

      const response = AuthUtils.createSuccessResponse('Email check completed', result);

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Handle user login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      const response = AuthUtils.createSuccessResponse(
        AuthConstants.MESSAGES.SUCCESS.LOGIN_SUCCESS,
        result,
      );

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Handle social login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async socialLogin(req, res) {
    try {
      const { provider, token } = req.body;

      // TODO: Verify social token and get profile
      // For now, assume profile is provided in request
      const profile = req.body.profile;

      const result = await AuthService.socialLogin(provider, profile);

      const response = AuthUtils.createSuccessResponse('Social login successful', result);

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Verify email address
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const result = await AuthService.verifyEmail(token);

      const response = AuthUtils.createSuccessResponse(
        AuthConstants.MESSAGES.SUCCESS.EMAIL_VERIFIED,
        { user: result },
      );

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Request password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const result = await AuthService.requestPasswordReset(email);

      const response = AuthUtils.createSuccessResponse(result.message, result);

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Reset password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      const result = await AuthService.resetPassword(token, password);

      const response = AuthUtils.createSuccessResponse(result.message);

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Change password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId; // From auth middleware

      const result = await AuthService.changePassword(userId, currentPassword, newPassword);

      const response = AuthUtils.createSuccessResponse(result.message);

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId; // From auth middleware
      const result = await AuthService.getProfile(userId);

      const response = AuthUtils.createSuccessResponse('Profile retrieved successfully', {
        user: result,
      });

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId; // From auth middleware
      const updateData = req.body;

      const result = await AuthService.updateProfile(userId, updateData);

      const response = AuthUtils.createSuccessResponse('Profile updated successfully', {
        user: result,
      });

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Delete user account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteAccount(req, res) {
    try {
      const userId = req.user.userId; // From auth middleware
      const result = await AuthService.deleteAccount(userId);

      const response = AuthUtils.createSuccessResponse(result.message);

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Refresh access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);

      const response = AuthUtils.createSuccessResponse('Token refreshed successfully', result);

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async logout(req, res) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // by removing the token. We can optionally implement token blacklisting here.

      const response = AuthUtils.createSuccessResponse(
        AuthConstants.MESSAGES.SUCCESS.LOGOUT_SUCCESS,
      );

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Complete user signup (Steps 2-5)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async completeUserSignup(req, res) {
    try {
      const { authId } = req.params;
      const signupData = req.body;

      const result = await AuthService.completeUserSignup(authId, signupData);

      const response = AuthUtils.createSuccessResponse(
        'User signup completed successfully',
        result,
      );

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Complete helper signup (Steps 2-5)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async completeHelperSignup(req, res) {
    try {
      const { authId } = req.params;
      const signupData = req.body;

      const result = await AuthService.completeHelperSignup(authId, signupData);

      const response = AuthUtils.createSuccessResponse(
        'Helper signup completed successfully',
        result,
      );

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Update user profile during signup
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateUserProfile(req, res) {
    try {
      const { authId } = req.params;
      const userData = req.body;

      const result = await AuthService.updateUserProfile(authId, userData);

      const response = AuthUtils.createSuccessResponse('User profile updated successfully', {
        user: result,
      });

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Update helper profile during signup
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateHelperProfile(req, res) {
    try {
      const { authId } = req.params;
      const helperData = req.body;

      const result = await AuthService.updateHelperProfile(authId, helperData);

      const response = AuthUtils.createSuccessResponse('Helper profile updated successfully', {
        helper: result,
      });

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Update emergency contacts during signup
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateEmergencyContacts(req, res) {
    try {
      const { authId } = req.params;
      const { emergencyContacts } = req.body;

      const result = await AuthService.updateEmergencyContacts(authId, emergencyContacts);

      const response = AuthUtils.createSuccessResponse('Emergency contacts updated successfully', {
        user: result,
      });

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Fetch medical information during signup
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getMedicalInfo(req, res) {
    try {
      const { authId } = req.params;
      const result = await AuthService.getMedicalInfoForSignup(authId);

      const response = AuthUtils.createSuccessResponse('Medical information retrieved successfully', {
        medical: result,
      });

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Update medical information during signup
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateMedicalInfo(req, res) {
    try {
      const { authId } = req.params;
      const medicalData = req.body;

      const result = await AuthService.updateMedicalInfo(authId, medicalData);

      const response = AuthUtils.createSuccessResponse('Medical information updated successfully', {
        medical: result,
      });

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Update location during signup
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateLocation(req, res) {
    try {
      const { authId } = req.params;
      const locationData = req.body;

      const result = await AuthService.updateLocation(authId, locationData);

      const response = AuthUtils.createSuccessResponse('Location updated successfully', {
        location: result,
      });

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Get signup progress
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getSignupProgress(req, res) {
    try {
      const { authId } = req.params;
      const result = await AuthService.getSignupProgress(authId);

      const response = AuthUtils.createSuccessResponse(
        'Signup progress retrieved successfully',
        result,
      );

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }

  /**
   * Update auth record (internal use for linking user/helper)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateAuth(req, res) {
    try {
      const { authId } = req.params;
      const updateData = req.body;

      const result = await AuthService.updateAuth(authId, updateData);

      const response = AuthUtils.createSuccessResponse('Auth record updated successfully', {
        auth: result,
      });

      res.status(response.statusCode).json(response.response);
    } catch (error) {
      const response = AuthUtils.createErrorResponse(error.message);
      res.status(response.statusCode).json(response.response);
    }
  }
}

export default AuthController;
