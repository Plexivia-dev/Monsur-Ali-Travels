import prisma from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signJwt } from '../utils/jwt.js';
import { generateDid } from '../utils/generateDid.js';

/**
 * @typedef {import('../validations/auth.validation.js').LoginInput} LoginInput
 * @typedef {import('../validations/auth.validation.js').RegisterInput} RegisterInput
 * @typedef {import('../validations/auth.validation.js').ChangePasswordInput} ChangePasswordInput
 */

export class AuthService {
  /**
   * Authenticates user and returns JWT token and sanitized profile
   * @param {LoginInput} input
   * @returns {Promise<{ user: any, token: string }>}
   */
  static async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), isActive: true },
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = signJwt({
      id: user.id,
      email: user.email,
      role: user.role,
      did: user.did,
      name: user.name,
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  /**
   * Registers a new user account
   * @param {RegisterInput} input
   * @returns {Promise<{ user: any, token: string }>}
   */
  static async register(input) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      const error = new Error('User with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await hashPassword(input.password);
    const did = generateDid();

    const newUser = await prisma.user.create({
      data: {
        did,
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash,
        role: input.role,
        department: input.department || '',
        designation: input.designation || '',
      },
    });

    const token = signJwt({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      did: newUser.did,
      name: newUser.name,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return { user: safeUser, token };
  }

  /**
   * Updates user password after verifying current password
   * @param {string} userId
   * @param {ChangePasswordInput} input
   * @returns {Promise<{ message: string }>}
   */
  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Retrieves current authenticated user profile
   * @param {string} userId
   * @returns {Promise<any>}
   */
  static async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        did: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        address: true,
        avatar: true,
        role: true,
        department: true,
        designation: true,
        assets: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Updates user profile info (name, username, phone, address, avatar)
   * @param {string} userId
   * @param {import('../validations/auth.validation.js').UpdateProfileInput} input
   * @returns {Promise<any>}
   */
  static async updateProfile(userId, input) {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Check username uniqueness if provided
    if (input.username && input.username.trim()) {
      const cleanUsername = input.username.trim().toLowerCase();
      const existingUser = await prisma.user.findFirst({
        where: {
          username: { equals: cleanUsername, mode: 'insensitive' },
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        const error = new Error('Username is already taken. Please choose another username.');
        error.statusCode = 409;
        throw error;
      }
    }

    const updateData = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.username !== undefined) updateData.username = input.username ? input.username.trim().toLowerCase() : null;
    if (input.phone !== undefined) updateData.phone = input.phone.trim();
    if (input.address !== undefined) updateData.address = input.address ? input.address.trim() : '';
    if (input.avatar !== undefined) updateData.avatar = input.avatar || '';

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        did: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        address: true,
        avatar: true,
        role: true,
        department: true,
        designation: true,
        assets: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}

export default AuthService;
