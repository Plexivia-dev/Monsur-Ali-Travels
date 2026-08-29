import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { UserModel } from "../../models/user.model.js";
import { comparePassword } from "../../utils/password.js";
import { createAccessToken, createRefreshToken } from "./AuthController.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { sendOtpEmail, send2faQrEmail } from "../../services/emailService.js";


// Helper to extract user from a short-lived 2FA session token
const resolveUserFromTwoFactorToken = async (twoFactorToken) => {
  if (!twoFactorToken) {
    throw new Error("2FA session token is missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(twoFactorToken, env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new Error("Your 2FA verification session has expired. Please log in again.");
  }

  if (decoded.purpose !== "2fa_login" || !decoded.did) {
    throw new Error("Invalid 2FA verification session token.");
  }

  const user = await UserModel.findOne({ did: decoded.did }).select(
    "+passwordHash +twoFactorSecret +emailOtp +emailOtpExpiresAt +refreshToken +refreshTokenExpiresAt",
  );

  if (!user || !user.isActive) {
    throw new Error("User account not found or is currently deactivated.");
  }

  return user;
};

// POST /auth/2fa/verify - Verifies Email OTP or Google Authenticator TOTP code and issues auth tokens
export const verify2fa = async (req, res, next) => {
  try {
    const { twoFactorToken, code, method = "email", email, password } = req.body ?? {};
    const trimmedCode = typeof code === "string" ? code.trim() : "";
    const selectedMethod = String(method).toLowerCase() === "authenticator" ? "authenticator" : "email";

    if (!trimmedCode) {
      return res.status(400).json({ status: "error", message: "Please enter the 6-digit verification code" });
    }

    let user;

    if (twoFactorToken) {
      user = await resolveUserFromTwoFactorToken(twoFactorToken);
    } else if (email && password) {
      // Legacy fallback
      const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
      user = await UserModel.findOne({ email: normalizedEmail }).select(
        "+passwordHash +twoFactorSecret +emailOtp +emailOtpExpiresAt +refreshToken +refreshTokenExpiresAt",
      );
      if (!user || !user.passwordHash) {
        return res.status(401).json({ status: "error", message: "Invalid credentials" });
      }
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ status: "error", message: "Invalid credentials" });
      }
    } else {
      return res.status(400).json({ status: "error", message: "2FA session token or login credentials required" });
    }

    // 1. Email OTP Verification Method
    if (selectedMethod === "email") {
      if (!user.emailOtp || !user.emailOtpExpiresAt) {
        return res.status(400).json({
          status: "error",
          message: "No verification code was requested or the code has expired. Please click Resend Code.",
        });
      }

      if (new Date() > new Date(user.emailOtpExpiresAt)) {
        return res.status(400).json({
          status: "error",
          message: "Your email verification code has expired. Please request a new code.",
        });
      }

      if (user.emailOtp !== trimmedCode) {
        return res.status(400).json({
          status: "error",
          message: "Invalid email verification code. Please check your email and try again.",
        });
      }

      // Clear the consumed OTP
      user.emailOtp = undefined;
      user.emailOtpExpiresAt = undefined;
    }

    // 2. Google Authenticator (TOTP) Verification Method
    if (selectedMethod === "authenticator") {
      if (!user.twoFactorSecret) {
        return res.status(400).json({
          status: "error",
          message: "Google Authenticator is not configured for your account yet. Please use Email verification or scan the setup QR code.",
        });
      }

      const isTokenValid = authenticator.verify({
        token: trimmedCode,
        secret: user.twoFactorSecret,
      });

      if (!isTokenValid) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired Authenticator code. Please enter the current 6-digit code shown in your app.",
        });
      }

      // Mark 2FA as permanently activated
      user.twoFactorEnabled = true;
      user.twoFactorMethod = "authenticator";
    }

    // Complete login by issuing tokens and updating login timestamp
    const refreshToken = createRefreshToken();
    const refreshTokenExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_MS);
    user.lastLogin = new Date();
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await user.save();

    const accessToken = createAccessToken(user);

    logger.info(
      { userId: user.id, did: user.did, method: selectedMethod },
      "2FA verification successful; auth session created",
    );

    res.json({
      status: "success",
      message: "Two-Factor Authentication verified successfully.",
      data: {
        user: {
          id: user.did,
          did: user.did,
          name: user.name,
          email: user.email,
          avatar: user.avatar || "",
          role: user.role,
          subRole: user.subRole || "",
          department: user.department || "",
          designation: user.designation || "",
          lastLogin: user.lastLogin,
        },
        accessToken,
        accessTokenExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
        refreshToken,
        refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/2fa/resend-email-otp - Dispatches a fresh 6-digit OTP code to the user's email
export const resendEmailOtp = async (req, res, next) => {
  try {
    const { twoFactorToken, email } = req.body ?? {};
    let user;

    if (twoFactorToken) {
      user = await resolveUserFromTwoFactorToken(twoFactorToken);
    } else if (email) {
      const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
      user = await UserModel.findOne({ email: normalizedEmail });
      if (!user || !user.isActive) {
        return res.status(404).json({ status: "error", message: "User account not found" });
      }
    } else {
      return res.status(400).json({ status: "error", message: "2FA session token is required" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.emailOtp = otp;
    user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const deliveryResult = await sendOtpEmail({
      toEmail: user.email,
      otp,
      name: user.name,
      type: "two-factor",
    });

    if (!deliveryResult.delivered) {
      logger.warn({ email: user.email, reason: deliveryResult.reason }, "Failed to send 2FA OTP email");
    }

    logger.info({ email: user.email }, "Resent 2FA email OTP code");

    res.json({
      status: "success",
      message: "A new 6-digit verification code has been sent to your email.",
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/2fa/setup-authenticator - Generates TOTP secret and QR code data URL for Authenticator app setup
export const setupAuthenticator = async (req, res, next) => {
  try {
    const { twoFactorToken } = req.body ?? {};
    let user;

    if (twoFactorToken) {
      user = await resolveUserFromTwoFactorToken(twoFactorToken);
    } else if (req.user?.did) {
      user = await UserModel.findOne({ did: req.user.did }).select("+twoFactorSecret");
    } else {
      return res.status(400).json({ status: "error", message: "2FA session token or authentication required" });
    }

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Generate secret if not already set
    let secret = user.twoFactorSecret;
    if (!secret) {
      secret = authenticator.generateSecret();
      user.twoFactorSecret = secret;
      await user.save();
    }

    // Generate OTPAuth URI
    const otpauth = authenticator.keyuri(user.email, "Monsur Ali Travels BD", secret);

    // Generate QR Code Data URL for instant rendering on frontend
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth, { width: 220, margin: 2 });

    res.json({
      status: "success",
      data: {
        secret,
        qrCodeDataUrl,
        otpauth,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/2fa/send-qr - Generates/retrieves TOTP secret and emails QR Code to user
export const sendQrCodeEmail = async (req, res, next) => {
  try {
    const { twoFactorToken, email, password } = req.body ?? {};
    let user;

    if (twoFactorToken) {
      user = await resolveUserFromTwoFactorToken(twoFactorToken);
    } else if (email && password) {
      const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
      user = await UserModel.findOne({ email: normalizedEmail }).select("+passwordHash +twoFactorSecret");
      if (!user || !user.passwordHash) {
        return res.status(401).json({ status: "error", message: "Invalid credentials" });
      }
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ status: "error", message: "Invalid credentials" });
      }
    } else {
      return res.status(400).json({ status: "error", message: "Email and password or 2FA token are required" });
    }

    // Generate secret if not already set
    let secret = user.twoFactorSecret;
    if (!secret) {
      secret = authenticator.generateSecret();
      user.twoFactorSecret = secret;
      await user.save();
    }

    // Dispatch 2FA QR code email
    const emailResult = await send2faQrEmail({
      toEmail: user.email,
      name: user.name,
      secret,
    });

    if (!emailResult.delivered) {
      logger.warn({ email: user.email, reason: emailResult.reason }, "Failed to send 2FA QR code email");
    }

    res.json({
      status: "success",
      message: "A QR Code has been sent to your email. Scan it in your Authenticator app to continue.",
    });
  } catch (error) {
    next(error);
  }
};
