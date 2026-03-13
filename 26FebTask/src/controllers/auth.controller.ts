import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  validateLogin,
  validateRegister,
  type LoginInput,
  type RegisterInput,
} from "../validators/auth.validation.js";
import { loginService, registerService } from "../services/auth.service.js";
import { handleError } from "../utils/userHelper.js";
import type { AppError } from "../types/appError.js";
import User from "../models/users/User.js";
import type {
  JwtPayload,
  AuthRequest,
} from "../middlewares/auth.middleware.js";

const COOKIE_NAME = "token";

export async function login(req: Request, res: Response): Promise<Response> {
  try {
    const body = req.body as Partial<LoginInput>;
    const errors = validateLogin(body);
    if (errors.length) {
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }

    const user = await loginService({
      email: body.email!,
      password: body.password!,
    });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { email: user.email!, role: user.role },
      process.env.JWT_SECRET ?? "changeme_secret",
      { expiresIn: "1d" },
    );

    const cookieOptions = {
      httpOnly: true,
      sameSite: "strict" as const,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.cookie("role", user.role, cookieOptions);
    res.header("X-Email", user.email!);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        username: user.username,
      },
    });
  } catch (err) {
    return handleError(res, err as AppError);
  }
}

export async function register(req: Request, res: Response): Promise<Response> {
  try {
    const body = req.body as Partial<RegisterInput>;
    const errors = validateRegister(body);
    if (errors.length) {
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }

    const user = await registerService({
      username: body.username!,
      email: body.email!,
      password: body.password!,
      mobileNumber: body.mobileNumber!,
      firstName: body.firstName!,
      lastName: body.lastName!,
      dob: new Date(body.dob!),
    });

    const token = jwt.sign(
      { email: user.email!, role: user.role },
      process.env.JWT_SECRET ?? "changeme_secret",
      { expiresIn: "1d" },
    );

    const cookieOptions = {
      httpOnly: true,
      sameSite: "strict" as const,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.cookie("role", user.role, cookieOptions);
    res.header("X-Email", user.email!);
    return res
      .status(201)
      .json({ success: true, message: "Registration successful" });
  } catch (err) {
    return handleError(res, err as AppError);
  }
}

export async function me(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.setHeader("X-Email", user.email!);
    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        fname: user.firstName,
        lname: user.lastName,
        email: user.email,
        dob: user.dob,
        status: user.status,
        address: user.address,
        mobileNumber: user.mobileNumber,
        role: user.role,
        employeeId: user.employeeId,
        managerId: user.managerId,
        teamLeadId: user.teamLeadId,
      },
    });
  } catch (err) {
    return handleError(res, err as AppError);
  }
}

export async function logout(_req: Request, res: Response): Promise<Response> {
  try {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "strict" });
    res.clearCookie("email", { httpOnly: true, sameSite: "strict" });
    res.clearCookie("role", { httpOnly: true, sameSite: "strict" });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return handleError(res, err as AppError);
  }
}
