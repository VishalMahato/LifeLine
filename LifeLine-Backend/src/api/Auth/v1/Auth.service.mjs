

import Auth from './Auth.model.mjs';
import AuthUtils from './Auth.utils.mjs';
import AuthConstants from './Auth.constants.mjs';
// Import service dependencies
import UserService from '../../User/User.service.mjs';
import HelperService from '../../Helper/Helper.service.mjs';
import MedicalService from '../../Medical/Medical.service.mjs';
import LocationService from '../../Location/Location.service.mjs';

/**
 * AuthService - Business logic layer for authentication operations
 * @author Senior Software Engineer
 * @version 1.0.0
 * @since 2026
 */
class AuthService {
    /**
     * Create initial auth record (Signup Step 1)
     * @param {Object} authData - Authentication data
     * @returns {Promise<Object>} Created auth record
     */
    static async createAuth(authData) {
        try {
            const { email, phoneNumber } = authData;

            // Check if email already exists
            const existingEmail = await Auth.findOne({ email: email.toLowerCase() });
            if (existingEmail) {
                throw new Error(AuthConstants.MESSAGES.VALIDATION.EMAIL_EXISTS);
            }

            // Check if phone already exists
            const existingPhone = await Auth.findOne({ phoneNumber });
            if (existingPhone) {
                throw new Error(AuthConstants.MESSAGES.VALIDATION.PHONE_EXISTS);
            }

            // Create auth record
            const auth = new Auth({
                ...authData,
                email: email.toLowerCase()
            });

            await auth.save();

            return AuthUtils.formatUserResponse(auth);
        } catch (error) {
            throw new Error(`Failed to create auth record: ${error.message}`);
        }
    }

    /**
     * Check if email exists and return user data
     * @param {string} email - Email to check
     * @returns {Promise<Object>} Check result
     */
    static async checkEmailExists(email) {
        try {
            const auth = await Auth.findOne({ email: email.toLowerCase() })
                .populate('userId')
                .populate('helperId');

            if (!auth) {
                return { exists: false };
            }

            return {
                exists: true,
                authId: auth._id,
                role: auth.role,
                isVerified: auth.isVerified,
                userData: auth.userId || auth.helperId
            };
        } catch (error) {
            throw new Error(`Email check failed: ${error.message}`);
        }
    }

    /**
     * Update auth record with user/helper ID
     * @param {string} authId - Auth record ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated auth record
     */
    static async updateAuth(authId, updateData) {
        try {
            const auth = await Auth.findByIdAndUpdate(
                authId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!auth) {
                throw new Error('Auth record not found');
            }

            return AuthUtils.formatUserResponse(auth);
        } catch (error) {
            throw new Error(`Failed to update auth record: ${error.message}`);
        }
    }

    /**
     * Authenticate user login
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Authentication result
     */
    static async login(email, password) {
        try {
            // Find user
            const auth = await Auth.findForAuth(email);
            if (!auth) {
                throw new Error(AuthConstants.MESSAGES.AUTH.INVALID_CREDENTIALS);
            }

            // Check if account is blocked
            if (auth.isBlocked) {
                throw new Error(AuthConstants.MESSAGES.AUTH.ACCOUNT_BLOCKED);
            }

            // Check if account is locked
            if (auth.isLocked) {
                throw new Error('Account is temporarily locked due to too many failed login attempts');
            }

            // Check if account is verified
            if (!auth.isVerified) {
                throw new Error(AuthConstants.MESSAGES.AUTH.ACCOUNT_NOT_VERIFIED);
            }

            // Check password
            const isPasswordValid = await auth.comparePassword(password);
            if (!isPasswordValid) {
                await auth.incLoginAttempts();
                throw new Error(AuthConstants.MESSAGES.AUTH.INVALID_CREDENTIALS);
            }

            // Reset login attempts on successful login
            await auth.resetLoginAttempts();

            // Generate tokens
            const payload = {
                userId: auth._id,
                email: auth.email,
                role: auth.role
            };

            const accessToken = AuthUtils.generateAccessToken(payload);
            const refreshToken = AuthUtils.generateRefreshToken(payload);

            return {
                user: AuthUtils.formatUserResponse(auth),
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    /**
     * Handle social login
     * @param {string} provider - Social provider (google/apple)
     * @param {Object} profile - Social profile data
     * @returns {Promise<Object>} Authentication result
     */
    static async socialLogin(provider, profile) {
        try {
            let auth = await Auth.findOne({
                socialProvider: provider,
                socialId: profile.id
            });

            if (!auth) {
                // Check if email already exists
                const existingAuth = await Auth.findOne({ email: profile.email.toLowerCase() });
                if (existingAuth) {
                    // Link social account to existing account
                    existingAuth.socialProvider = provider;
                    existingAuth.socialId = profile.id;
                    existingAuth.isVerified = true; // Social accounts are pre-verified
                    await existingAuth.save();
                    auth = existingAuth;
                } else {
                    // Create new account
                    auth = new Auth({
                        name: profile.name,
                        email: profile.email.toLowerCase(),
                        role: AuthConstants.ROLES.USER, // Default to user
                        socialProvider: provider,
                        socialId: profile.id,
                        isVerified: true,
                        profileImage: profile.picture
                    });
                    await auth.save();
                }
            }

            // Generate tokens
            const payload = {
                userId: auth._id,
                email: auth.email,
                role: auth.role
            };

            const accessToken = AuthUtils.generateAccessToken(payload);
            const refreshToken = AuthUtils.generateRefreshToken(payload);

            return {
                user: AuthUtils.formatUserResponse(auth),
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw new Error(`Social login failed: ${error.message}`);
        }
    }

    /**
     * Verify email address
     * @param {string} token - Verification token
     * @returns {Promise<Object>} Verification result
     */
    static async verifyEmail(token) {
        try {
            const auth = await Auth.findByVerificationToken(token);
            if (!auth) {
                throw new Error('Invalid or expired verification token');
            }

            auth.isVerified = true;
            auth.emailVerificationToken = undefined;
            auth.emailVerificationExpires = undefined;

            await auth.save();

            return AuthUtils.formatUserResponse(auth);
        } catch (error) {
            throw new Error(`Email verification failed: ${error.message}`);
        }
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} Reset request result
     */
    static async requestPasswordReset(email) {
        try {
            const auth = await Auth.findOne({ email: email.toLowerCase() });
            if (!auth) {
                // Don't reveal if email exists or not for security
                return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
            }

            const resetToken = auth.generatePasswordResetToken();
            await auth.save();

            // TODO: Send email with reset token
            // await EmailService.sendPasswordResetEmail(auth.email, resetToken);

            return {
                success: true,
                message: AuthConstants.MESSAGES.SUCCESS.PASSWORD_RESET_SENT,
                resetToken // Remove in production, only for testing
            };
        } catch (error) {
            throw new Error(`Password reset request failed: ${error.message}`);
        }
    }

    /**
     * Reset password using token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Reset result
     */
    static async resetPassword(token, newPassword) {
        try {
            const auth = await Auth.findByPasswordResetToken(token);
            if (!auth) {
                throw new Error(AuthConstants.MESSAGES.AUTH.RESET_TOKEN_INVALID);
            }

            auth.password = newPassword;
            auth.passwordResetToken = undefined;
            auth.passwordResetExpires = undefined;

            await auth.save();

            return {
                success: true,
                message: AuthConstants.MESSAGES.SUCCESS.PASSWORD_RESET_SUCCESS
            };
        } catch (error) {
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }

    /**
     * Change password for authenticated user
     * @param {string} userId - User ID
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Change result
     */
    static async changePassword(userId, currentPassword, newPassword) {
        try {
            const auth = await Auth.findById(userId);
            if (!auth) {
                throw new Error('User not found');
            }

            const isCurrentPasswordValid = await auth.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            auth.password = newPassword;
            await auth.save();

            return {
                success: true,
                message: 'Password changed successfully'
            };
        } catch (error) {
            throw new Error(`Password change failed: ${error.message}`);
        }
    }

    /**
     * Get user profile
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile
     */
    static async getProfile(userId) {
        try {
            const auth = await Auth.findById(userId)
                .populate('userId')
                .populate('helperId');

            if (!auth) {
                throw new Error('User not found');
            }

            return AuthUtils.formatUserResponse(auth);
        } catch (error) {
            throw new Error(`Failed to get profile: ${error.message}`);
        }
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated profile
     */
    static async updateProfile(userId, updateData) {
        try {
            const auth = await Auth.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!auth) {
                throw new Error('User not found');
            }

            return AuthUtils.formatUserResponse(auth);
        } catch (error) {
            throw new Error(`Profile update failed: ${error.message}`);
        }
    }

    /**
     * Delete user account
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Deletion result
     */
    static async deleteAccount(userId) {
        try {
            const auth = await Auth.findById(userId);
            if (!auth) {
                throw new Error('User not found');
            }

            // Soft delete by marking as blocked
            auth.isBlocked = true;
            await auth.save();

            return {
                success: true,
                message: 'Account deleted successfully'
            };
        } catch (error) {
            throw new Error(`Account deletion failed: ${error.message}`);
        }
    }

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<Object>} New tokens
     */
    static async refreshToken(refreshToken) {
        try {
            const decoded = AuthUtils.verifyToken(refreshToken);

            const auth = await Auth.findById(decoded.userId);
            if (!auth || auth.isBlocked) {
                throw new Error('Invalid refresh token');
            }

            const payload = {
                userId: auth._id,
                email: auth.email,
                role: auth.role
            };

            const newAccessToken = AuthUtils.generateAccessToken(payload);
            const newRefreshToken = AuthUtils.generateRefreshToken(payload);

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }

    /**
     * Complete user signup flow (Signup Step 2-5)
     * @param {string} authId - Auth record ID
     * @param {Object} signupData - Complete signup data
     * @returns {Promise<Object>} Complete signup result
     */
    static async completeUserSignup(authId, signupData) {
        try {
            const auth = await Auth.findById(authId);
            if (!auth) {
                throw new Error('Auth record not found');
            }

            if (auth.role !== AuthConstants.ROLES.USER) {
                throw new Error('Invalid role for user signup');
            }

            const {
                userInfo,
                emergencyContacts,
                medicalInfo,
                location
            } = signupData;

            // Step 2: Create user profile
            const userData = {
                authId,
                ...userInfo
            };
            const user = await UserService.createUser(userData);

            // Step 3: Update emergency contacts
            if (emergencyContacts && emergencyContacts.length > 0) {
                await UserService.updateEmergencyContacts(user.id, emergencyContacts);
            }

            // Step 4: Create medical information (optional)
            let medical = null;
            if (medicalInfo) {
                const medicalData = {
                    userId: user.id,
                    ...medicalInfo
                };
                medical = await MedicalService.createMedicalInfo(medicalData);

                // Update user with medical ID
                await UserService.updateMedicalInfo(user.id, medical.id);
            }

            // Step 5: Create location (optional)
            let userLocation = null;
            if (location) {
                const locationData = {
                    userId: user.id,
                    ...location
                };
                userLocation = await LocationService.createLocation(locationData);

                // Update user with location ID
                await UserService.updateLocation(user.id, userLocation.id);
            }

            // Update auth record with user ID
            await this.updateAuth(authId, { userId: user.id });

            return {
                auth: AuthUtils.formatUserResponse(auth),
                user,
                medical,
                location: userLocation,
                completedSteps: {
                    userProfile: true,
                    emergencyContacts: !!emergencyContacts,
                    medicalInfo: !!medical,
                    location: !!userLocation
                }
            };
        } catch (error) {
            throw new Error(`User signup completion failed: ${error.message}`);
        }
    }

    /**
     * Complete helper signup flow (Signup Step 2-5)
     * @param {string} authId - Auth record ID
     * @param {Object} signupData - Complete signup data
     * @returns {Promise<Object>} Complete signup result
     */
    static async completeHelperSignup(authId, signupData) {
        try {
            const auth = await Auth.findById(authId);
            if (!auth) {
                throw new Error('Auth record not found');
            }

            if (auth.role !== AuthConstants.ROLES.HELPER) {
                throw new Error('Invalid role for helper signup');
            }

            const {
                helperInfo,
                verifySkills,
                medicalInfo,
                location
            } = signupData;

            // Step 2: Create helper profile
            const helperData = {
                authId,
                ...helperInfo
            };
            const helper = await HelperService.createHelper(helperData);

            // Step 3: Verify skills/credentials (if provided)
            if (verifySkills && verifySkills.credentials) {
                for (const credential of verifySkills.credentials) {
                    if (credential.verificationStatus === 'verified') {
                        await HelperService.verifyCredentials(helper.id, credential.id, 'verified');
                    }
                }
            }

            // Step 4: Create medical information (optional)
            let medical = null;
            if (medicalInfo) {
                const medicalData = {
                    userId: helper.id, // Helper can also have medical info
                    ...medicalInfo
                };
                medical = await MedicalService.createMedicalInfo(medicalData);
            }

            // Step 5: Create location
            let helperLocation = null;
            if (location) {
                const locationData = {
                    userId: helper.id,
                    ...location
                };
                helperLocation = await LocationService.createLocation(locationData);

                // Update helper with location ID
                await HelperService.updateHelper(helper.id, { locationId: helperLocation.id });
            }

            // Update auth record with helper ID
            await this.updateAuth(authId, { helperId: helper.id });

            return {
                auth: AuthUtils.formatUserResponse(auth),
                helper,
                medical,
                location: helperLocation,
                completedSteps: {
                    helperProfile: true,
                    skillsVerification: !!verifySkills,
                    medicalInfo: !!medical,
                    location: !!helperLocation
                }
            };
        } catch (error) {
            throw new Error(`Helper signup completion failed: ${error.message}`);
        }
    }

    /**
     * Update user profile during signup
     * @param {string} authId - Auth record ID
     * @param {Object} userData - User profile data
     * @returns {Promise<Object>} Updated user profile
     */
    static async updateUserProfile(authId, userData) {
        try {
            const auth = await Auth.findById(authId).populate('userId');
            if (!auth || !auth.userId) {
                throw new Error('User profile not found');
            }

            const updatedUser = await UserService.updateUser(auth.userId._id, userData);
            return updatedUser;
        } catch (error) {
            throw new Error(`User profile update failed: ${error.message}`);
        }
    }

    /**
     * Update helper profile during signup
     * @param {string} authId - Auth record ID
     * @param {Object} helperData - Helper profile data
     * @returns {Promise<Object>} Updated helper profile
     */
    static async updateHelperProfile(authId, helperData) {
        try {
            const auth = await Auth.findById(authId).populate('helperId');
            if (!auth || !auth.helperId) {
                throw new Error('Helper profile not found');
            }

            const updatedHelper = await HelperService.updateHelper(auth.helperId._id, helperData);
            return updatedHelper;
        } catch (error) {
            throw new Error(`Helper profile update failed: ${error.message}`);
        }
    }

    /**
     * Update emergency contacts during signup
     * @param {string} authId - Auth record ID
     * @param {Array} emergencyContacts - Emergency contacts
     * @returns {Promise<Object>} Updated user profile
     */
    static async updateEmergencyContacts(authId, emergencyContacts) {
        try {
            const auth = await Auth.findById(authId).populate('userId');
            if (!auth || !auth.userId) {
                throw new Error('User profile not found');
            }

            const updatedUser = await UserService.updateEmergencyContacts(auth.userId._id, emergencyContacts);
            return updatedUser;
        } catch (error) {
            throw new Error(`Emergency contacts update failed: ${error.message}`);
        }
    }

    /**
     * Update medical information during signup
     * @param {string} authId - Auth record ID
     * @param {Object} medicalData - Medical information
     * @returns {Promise<Object>} Updated medical information
     */
    static async updateMedicalInfo(authId, medicalData) {
        try {
            const auth = await Auth.findById(authId).populate('userId').populate('helperId');
            const profileId = auth.userId?._id || auth.helperId?._id;

            if (!profileId) {
                throw new Error('User or helper profile not found');
            }

            // Try to find existing medical info
            let medical;
            try {
                medical = await MedicalService.getMedicalInfoByUserId(profileId);
                // Update existing
                medical = await MedicalService.updateMedicalInfo(medical.id, medicalData);
            } catch (error) {
                // Create new
                const newMedicalData = {
                    userId: profileId,
                    ...medicalData
                };
                medical = await MedicalService.createMedicalInfo(newMedicalData);
            }

            // Update profile with medical ID
            if (auth.userId) {
                await UserService.updateMedicalInfo(auth.userId._id, medical.id);
            } else if (auth.helperId) {
                await HelperService.updateHelper(auth.helperId._id, { medicalId: medical.id });
            }

            return medical;
        } catch (error) {
            throw new Error(`Medical info update failed: ${error.message}`);
        }
    }

    /**
     * Update location during signup
     * @param {string} authId - Auth record ID
     * @param {Object} locationData - Location data
     * @returns {Promise<Object>} Updated location
     */
    static async updateLocation(authId, locationData) {
        try {
            const auth = await Auth.findById(authId).populate('userId').populate('helperId');
            const profileId = auth.userId?._id || auth.helperId?._id;

            if (!profileId) {
                throw new Error('User or helper profile not found');
            }

            const newLocationData = {
                userId: profileId,
                ...locationData
            };
            const location = await LocationService.createLocation(newLocationData);

            // Update profile with location ID
            if (auth.userId) {
                await UserService.updateLocation(auth.userId._id, location.id);
            } else if (auth.helperId) {
                await HelperService.updateHelper(auth.helperId._id, { locationId: location.id });
            }

            return location;
        } catch (error) {
            throw new Error(`Location update failed: ${error.message}`);
        }
    }

    /**
     * Get signup progress
     * @param {string} authId - Auth record ID
     * @returns {Promise<Object>} Signup progress
     */
    static async getSignupProgress(authId) {
        try {
            const auth = await Auth.findById(authId)
                .populate('userId')
                .populate('helperId');

            if (!auth) {
                throw new Error('Auth record not found');
            }

            const progress = {
                authCreated: true,
                role: auth.role,
                profileCreated: false,
                emergencyContacts: false,
                medicalInfo: false,
                location: false,
                isComplete: false
            };

            if (auth.role === AuthConstants.ROLES.USER && auth.userId) {
                const user = auth.userId;
                progress.profileCreated = true;
                progress.emergencyContacts = user.emergencyContacts && user.emergencyContacts.length > 0;
                progress.medicalInfo = !!user.medicalId;
                progress.location = !!user.locationId;
                progress.isComplete = user.profileCompleted;
            } else if (auth.role === AuthConstants.ROLES.HELPER && auth.helperId) {
                const helper = auth.helperId;
                progress.profileCreated = true;
                progress.emergencyContacts = false; // Helpers don't have emergency contacts in same way
                progress.medicalInfo = false; // Optional for helpers
                progress.location = !!helper.locationId;
                progress.isComplete = helper.verificationStatus === 'verified';
            }

            return progress;
        } catch (error) {
            throw new Error(`Failed to get signup progress: ${error.message}`);
        }
    }
}

export default AuthService;