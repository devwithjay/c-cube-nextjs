
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import {
  getAuthenticatedAdmin
} from "./admin.auth.service.js";

/**
 * Require authenticated admin.
 */
export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing."
      });
    }

    if (!env.JWT_SECRET) {
      const error = new Error(
        "JWT_SECRET is not configured."
      );

      error.statusCode = 500;
      throw error;
    }

    const payload = jwt.verify(
      token,
      env.JWT_SECRET
    );

    if (
      !payload ||
      !payload.sub
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token."
      });
    }

    const admin = await getAuthenticatedAdmin(
      Number(payload.sub)
    );

    req.admin = admin;

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired."
      });
    }

    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token."
      });
    }

    next(error);
  }
}

/**
 * Require super-admin privileges.
 */
export function requireSuperAdmin(
  req,
  res,
  next
) {
  if (
    !req.admin ||
    req.admin.role !== "super_admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Super admin access required."
    });
  }

  next();
}
