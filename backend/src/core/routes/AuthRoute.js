import { Router } from "express";
import { createSuperAdmin, login, refreshToken, logout, googleAuth } from "../controllers/AuthController.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/google", googleAuth);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);
// Creation of the Owner / super-admin is intentionally disabled by default.
// If you need to create an Owner, enable the endpoint below in a controlled environment.
// authRouter.post("/create-super-admin", createSuperAdmin);

export default authRouter;
