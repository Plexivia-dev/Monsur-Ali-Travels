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


// Configure TOTP window to allow +/- 1 step (30 seconds) tolerance for clock drift
authenticator.options = { window: 1 };

// Helper to extract user from a short-lived 2FA session token (supports body, headers, or query)
const resolveUserFromTwoFactorToken = async (req, bodyToken) => {
  const authHeader = req?.headers?.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;
  const customHeaderToken = req?.headers?.["x-two-factor-token"] || req?.headers?.["twofactortoken"];

  const candidates = [
    bodyToken,
    req?.body?.twoFactorToken,
    req?.body?.token,
    customHeaderToken,
    bearerToken,
    req?.query?.twoFactorToken,
  ].filter(Boolean);

  if (candidates.length === 0) {
    const err = new Error("2FA session token is missing");
    err.status = 400;
    throw err;
  }

  let decoded = null;
  let hasValidToken = false;

  for (const token of candidates) {
    try {
      const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
      if (payload.purpose === "2fa_login" && payload.did) {
        decoded = payload;
        hasValidToken = true;
        break;
      }
    } catch {
      // Continue to test next candidate token
    }
  }

  if (!hasValidToken || !decoded) {
    const error = new Error("Your 2FA verification session has expired. Please log in again.");
    error.status = 401;
    throw error;
  }

  const user = await UserModel.findOne({ did: decoded.did }).select(
    "+passwordHash +twoFactorSecret +emailOtp +emailOtpExpiresAt +refreshToken +refreshTokenExpiresAt",
  );

  if (!user || !user.isActive) {
    const err = new Error("User account not found or is currently deactivated.");
    err.status = 404;
    throw err;
  }

  return user;
};

// POST /auth/2fa/verify - Verifies Email OTP or Google Authenticator TOTP code and issues auth tokens
export const verify2fa = async (req, res, next) => {
  try {
    const { twoFactorToken, code, method = "authenticator", email, password } = req.body ?? {};
    const rawCode = code !== null && code !== undefined ? String(code).trim() : "";
    const trimmedCode = rawCode.replace(/\s+/g, "");
    const selectedMethod = String(method).toLowerCase() === "email" ? "email" : "authenticator";

    if (!trimmedCode) {
      return res.status(400).json({ status: "error", message: "Please enter the 6-digit verification code" });
    }

    if (trimmedCode.length !== 6) {
      return res.status(400).json({ status: "error", message: "Verification code must be exactly 6 digits" });
    }

    let user;

    try {
      user = await resolveUserFromTwoFactorToken(req, twoFactorToken);
    } catch (tokenErr) {
      if (email && password) {
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
        return res.status(tokenErr.status || 400).json({ status: "error", message: tokenErr.message });
      }
    }

    let isVerified = false;

    // 1. Check Authenticator (TOTP)
    if (user.twoFactorSecret) {
      isVerified =
        authenticator.verify({ token: trimmedCode, secret: user.twoFactorSecret }) ||
        authenticator.check(trimmedCode, user.twoFactorSecret);
    }

    // 2. Fallback check Email OTP if TOTP check didn't pass
    if (!isVerified && user.emailOtp && user.emailOtpExpiresAt) {
      if (new Date() <= new Date(user.emailOtpExpiresAt) && user.emailOtp === trimmedCode) {
        isVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpiresAt = undefined;
      }
    }

    if (!isVerified) {
      if (selectedMethod === "authenticator" && !user.twoFactorSecret && !user.emailOtp) {
        return res.status(400).json({
          status: "error",
          message: "Google Authenticator is not configured for your account yet. Please use Email verification or scan the setup QR code.",
        });
      }

      return res.status(400).json({
        status: "error",
        message: "Invalid or expired verification code. Please check your 6-digit code and try again.",
      });
    }

    // Mark 2FA as permanently activated
    if (user.twoFactorSecret && !user.twoFactorEnabled) {
      user.twoFactorEnabled = true;
      user.twoFactorMethod = selectedMethod;
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

    if (twoFactorToken || req.headers.authorization || req.headers["x-two-factor-token"]) {
      user = await resolveUserFromTwoFactorToken(req, twoFactorToken);
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
    const emailOtpExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    await UserModel.updateOne(
      { did: user.did },
      { $set: { emailOtp: otp, emailOtpExpiresAt } },
    );

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

    if (twoFactorToken || req.headers.authorization || req.headers["x-two-factor-token"]) {
      user = await resolveUserFromTwoFactorToken(req, twoFactorToken);
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

    if (twoFactorToken || req.headers.authorization || req.headers["x-two-factor-token"]) {
      user = await resolveUserFromTwoFactorToken(req, twoFactorToken);
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
