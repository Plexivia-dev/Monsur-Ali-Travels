import prisma from '../config/prisma.js';
import { hashPassword } from '../utils/password.js';
import { generateDid } from '../utils/generateDid.js';
import { getPaginationMeta } from '../utils/apiResponse.js';

export class UserService {
  /**
   * List users with pagination and search
   * @param {Object} query
   * @param {number} query.page
   * @param {number} query.limit
   * @param {string} [query.search]
   * @param {string} [query.role]
   * @param {string} [query.department]
   */
  static async listUsers({ page = 1, limit = 10, search, role, department }) {
    const where = { isActive: true };

    if (role && role !== 'all') {
      where.role = role;
    }

    if (department && department !== 'all') {
      where.department = { contains: department, mode: 'insensitive' };
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { department: { contains: term, mode: 'insensitive' } },
        { designation: { contains: term, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.user.count({ where });
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        did: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        designation: true,
        assets: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);
    return { users, pagination };
  }

  /**
   * Get single user by ID
   * @param {string} id
   */
  static async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        did: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        designation: true,
        assets: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
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
   * Create user account (Admin/Owner)
   * @param {Object} input
   */
  static async createUser(input) {
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
        assets: input.assets || [],
      },
      select: {
        id: true,
        did: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        designation: true,
        assets: true,
        createdAt: true,
      },
    });

    return newUser;
  }

  /**
   * Update user details
   * @param {string} id
   * @param {Object} input
   */
  static async updateUser(id, input) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: input,
      select: {
        id: true,
        did: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        designation: true,
        assets: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Soft delete user
   * @param {string} id
   */
  static async deleteUser(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User account disabled successfully' };
  }
}

export default UserService;
