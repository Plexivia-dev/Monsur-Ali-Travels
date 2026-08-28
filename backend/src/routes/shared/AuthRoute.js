import { Router } from "express";
import {
  createSuperAdmin,
  login,
  refreshToken,
  logout,
  googleAuth,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../../controllers/shared/AuthController.js";
import {
  sendQrCodeEmail,
  verify2fa,
  resendEmailOtp,
  setupAuthenticator,
} from "../../controllers/shared/TwoFactorController.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/google", googleAuth);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);

// Two-Factor Authentication (2FA) Routes
authRouter.post("/2fa/verify", verify2fa);
authRouter.post("/2fa/resend-email-otp", resendEmailOtp);
authRouter.post("/2fa/setup-authenticator", setupAuthenticator);
authRouter.post("/2fa/send-qr", sendQrCodeEmail);

// Forgot Password & Reset Password
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-reset-otp", verifyResetOtp);
authRouter.post("/reset-password", resetPassword);

authRouter.get("/me", authenticateToken, getProfile);
authRouter.put("/profile", authenticateToken, updateProfile);
authRouter.post("/change-password", authenticateToken, changePassword);

// Creation of the Owner / super-admin is intentionally disabled by default.
// If you need to create an Owner, enable the endpoint below in a controlled environment.
// authRouter.post("/create-super-admin", createSuperAdmin);

export default authRouter;
