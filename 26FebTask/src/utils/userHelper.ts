import { Response } from "express";
import mongoose from "mongoose";
import User from "../models/users/User.js";
import type { AppError } from "../types/appError.js";

// ── Param / query helpers 

export function getParam(
  params: Record<string, string | string[]>,
  key: string
): string | undefined {
  try {
    const val = params[key];
    return Array.isArray(val) ? val[0] : val;
  } catch {
    return undefined;
  }
}

export function getQuery(
  query: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  try {
    const val = query[key];
    if (Array.isArray(val)) return val[0];
    return val;
  } catch {
    return undefined;
  }
}

export function getBoolFlag(
  query: Record<string, string | string[] | undefined>,
  key: string
): boolean {
  try {
    return getQuery(query, key) === "true";
  } catch {
    return false;
  }
}

// ── Employee ID generator ──────────────────────────────────────────────────────

export async function generateEmployeeId({
  firstName,
  lastName,
  dob,
  mobileNumber
}: {
  firstName: string;
  lastName: string;
  dob: Date;
  mobileNumber: string;
}): Promise<string> {
  try {
    const first  = firstName.substring(0, 3).toLowerCase();
    const last   = lastName.slice(-2).toLowerCase();
    const month  = dob.toLocaleString("default", { month: "short" }).toLowerCase();
    // last 4 digits of mobile number (strip country code prefix)
    const mobile = mobileNumber.replace(/\D/g, "").slice(-4);
    const baseId = `${first}_${last}_${month}_${mobile}`;
    let finalId  = baseId;
    let counter  = 1;
    while (await (mongoose.models.User as typeof User)?.findOne({ employeeId: finalId })) {
      finalId = `${baseId}_${counter}`;
      counter++;
    }
    return finalId;
  } catch (err) {
    throw new Error(
      `Failed to generate employee ID: ${(err as Error).message}`
    );
  }
}

// ── Error handler 

export function handleError(res: Response, err: AppError): Response {
  try {
    return res.status(err.statusCode ?? 500).json({
      success: false,
      message: err.message ?? "Internal server error"
    });
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
