import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";

import {
  findAdminByEmail,
  findAdminById,
  createAdmin,
  updateAdminLastLogin,
  updateAdminPassword,
  updateAdminEmail
} from "./admin.auth.repository.js";

/**
 * Validate and normalize a VIT email address.
 *
 * Allowed:
 *   anything@vit.edu
 *
 * Not allowed:
 *   anything@gmail.com
 *   anything@vit.edu.in
 *   anything@outlook.com
 */
function validateVitEmail(email) {
  if (
    typeof email !== "string" ||
    !email.trim()
  ) {
    const error = new Error(
      "Email address is required."
    );

    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const vitEmailRegex =
    /^[^\s@]+@vit\.edu$/;

  if (!vitEmailRegex.test(normalizedEmail)) {
    const error = new Error(
      "Admin email must be a valid VIT email address ending with @vit.edu."
    );

    error.statusCode = 400;
    throw error;
  }

  return normalizedEmail;
}

/**
 * Validate password input.
 */
function validatePassword(password) {
  if (
    typeof password !== "string" ||
    !password
  ) {
    const error = new Error(
      "Password is required."
    );

    error.statusCode = 400;
    throw error;
  }

  return password;
}

/**
 * Create JWT token for an admin.
 */
export function createAdminToken(admin) {
  /*
   * IMPORTANT:
   * env.js exposes JWT_SECRET and JWT_EXPIRES_IN.
   */
  if (!env.JWT_SECRET) {
    const error = new Error(
      "JWT_SECRET is not configured. Please add JWT_SECRET to the backend .env file."
    );

    error.statusCode = 500;
    throw error;
  }

  return jwt.sign(
    {
      sub: String(admin.id),
      role: admin.role,
      email: admin.email
    },
    env.JWT_SECRET,
    {
      expiresIn:
        env.JWT_EXPIRES_IN || "7d"
    }
  );
}

/**
 * Login admin.
 *
 * Only @vit.edu accounts are allowed.
 */
export async function loginAdmin(
  email,
  password
) {
  const normalizedEmail =
    validateVitEmail(email);

  validatePassword(password);

  const admin =
    await findAdminByEmail(
      normalizedEmail
    );

  /*
   * Do not reveal whether the email
   * or password was incorrect.
   */
  if (!admin) {
    const error = new Error(
      "Invalid email or password."
    );

    error.statusCode = 401;
    throw error;
  }

  if (!admin.is_active) {
    const error = new Error(
      "This admin account has been disabled."
    );

    error.statusCode = 403;
    throw error;
  }

  const passwordMatches =
    await bcrypt.compare(
      password,
      admin.password_hash
    );

  if (!passwordMatches) {
    const error = new Error(
      "Invalid email or password."
    );

    error.statusCode = 401;
    throw error;
  }

  await updateAdminLastLogin(
    admin.id
  );

  const token =
    createAdminToken(admin);

  return {
    token,

    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  };
}

/**
 * Get currently authenticated admin.
 */
export async function getAuthenticatedAdmin(
  adminId
) {
  const admin =
    await findAdminById(adminId);

  if (!admin) {
    const error = new Error(
      "Admin account not found."
    );

    error.statusCode = 404;
    throw error;
  }

  if (!admin.is_active) {
    const error = new Error(
      "This admin account has been disabled."
    );

    error.statusCode = 403;
    throw error;
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,

    isActive: Boolean(
      admin.is_active
    ),

    lastLoginAt:
      admin.last_login_at,

    createdAt:
      admin.created_at
  };
}

/**
 * Create the initial admin account.
 *
 * This should only be used during initial setup.
 */
export async function createInitialAdmin(
  data
) {
  if (
    !data ||
    typeof data !== "object"
  ) {
    const error = new Error(
      "Admin data is required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    typeof data.name !== "string" ||
    !data.name.trim()
  ) {
    const error = new Error(
      "Admin name is required."
    );

    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail =
    validateVitEmail(data.email);

  const password =
    validatePassword(
      data.password
    );

  if (password.length < 8) {
    const error = new Error(
      "Password must contain at least 8 characters."
    );

    error.statusCode = 400;
    throw error;
  }

  /*
   * Prevent duplicate admin accounts.
   */
  const existingAdmin =
    await findAdminByEmail(
      normalizedEmail
    );

  if (existingAdmin) {
    const error = new Error(
      "An admin account with this email already exists."
    );

    error.statusCode = 409;
    throw error;
  }

  /*
   * bcrypt cost factor 12.
   */
  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );

  const role =
    data.role === "super_admin"
      ? "super_admin"
      : "admin";

  const admin =
    await createAdmin({
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role
    });

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role
  };
}

/**
 * Change admin password.
 */
export async function changeAdminPassword(
  adminId,
  currentPassword,
  newPassword
) {
  if (
    typeof currentPassword !== "string" ||
    !currentPassword
  ) {
    const error = new Error(
      "Current password is required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    typeof newPassword !== "string" ||
    !newPassword
  ) {
    const error = new Error(
      "New password is required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error(
      "New password must contain at least 8 characters."
    );

    error.statusCode = 400;
    throw error;
  }

  if (currentPassword === newPassword) {
    const error = new Error(
      "New password must be different from the current password."
    );

    error.statusCode = 400;
    throw error;
  }

  const admin =
    await findAdminById(adminId);

  if (!admin || !admin.is_active) {
    const error = new Error(
      "Admin account not found."
    );

    error.statusCode = 404;
    throw error;
  }

  const currentPasswordMatches =
    await bcrypt.compare(
      currentPassword,
      admin.password_hash
    );

  if (!currentPasswordMatches) {
    const error = new Error(
      "Current password is incorrect."
    );

    error.statusCode = 401;
    throw error;
  }

  const newPasswordHash =
    await bcrypt.hash(
      newPassword,
      12
    );

  await updateAdminPassword(
    adminId,
    newPasswordHash
  );

  return {
    success: true
  };
}

/**
 * Change admin email.
 */
export async function changeAdminEmail(
  adminId,
  currentPassword,
  newEmail
) {
  const normalizedEmail =
    validateVitEmail(
      newEmail
    );

  if (
    typeof currentPassword !== "string" ||
    !currentPassword
  ) {
    const error = new Error(
      "Current password is required."
    );

    error.statusCode = 400;
    throw error;
  }

  const admin =
    await findAdminByEmail(
      normalizedEmail
    );

  if (
    admin &&
    admin.id !== adminId
  ) {
    const error = new Error(
      "An admin account with this email already exists."
    );

    error.statusCode = 409;
    throw error;
  }

  const currentAdmin =
    await findAdminById(
      adminId
    );

  if (
    !currentAdmin ||
    !currentAdmin.is_active
  ) {
    const error = new Error(
      "Admin account not found."
    );

    error.statusCode = 404;
    throw error;
  }

  const passwordMatches =
    await bcrypt.compare(
      currentPassword,
      currentAdmin.password_hash
    );

  if (!passwordMatches) {
    const error = new Error(
      "Current password is incorrect."
    );

    error.statusCode = 401;
    throw error;
  }

  const updatedAdmin =
    await updateAdminEmail(
      adminId,
      normalizedEmail
    );

  return {
    token:
      createAdminToken(
        updatedAdmin
      ),

    admin: {
      id: updatedAdmin.id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      role: updatedAdmin.role
    }
  };
}

/**
 * Exported helper in case another
 * admin module needs to validate a VIT email.
 */
export {
  validateVitEmail
};
