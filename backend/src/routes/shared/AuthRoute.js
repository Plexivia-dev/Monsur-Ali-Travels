import { Router } from "express";
import { createSuperAdmin, login, refreshToken, logout, googleAuth, getProfile, updateProfile } from "../../controllers/shared/AuthController.js";
import { sendQrCodeEmail, verify2fa } from "../../controllers/shared/TwoFactorController.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/google", googleAuth);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);
authRouter.post("/2fa/send-qr", sendQrCodeEmail);
authRouter.post("/2fa/verify", verify2fa);

authRouter.get("/me", authenticateToken, getProfile);
authRouter.put("/profile", authenticateToken, updateProfile);

// Creation of the Owner / super-admin is intentionally disabled by default.
// If you need to create an Owner, enable the endpoint below in a controlled environment.
// authRouter.post("/create-super-admin", createSuperAdmin);

export default authRouter;
