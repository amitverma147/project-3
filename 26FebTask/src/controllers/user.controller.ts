import { Response } from "express";
import {
  createUserService,
  getAllUsersService,
  getUsersCountService,
  getUserByIdService,
  updateUserService,
  transferEmployeeService,
} from "../services/user.service.js";
import {
  validateCreateUser,
  validateUpdateUser,
  type CreateUserInput,
  type UpdateUserInput,
} from "../validators/user.validation.js";
import User from "../models/users/User.js";
import { UserRole } from "../models/users/user.types.js";
import type { IUser } from "../models/users/user.types.js";
import type { AppError } from "../types/appError.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  getParam,
  getQuery,
  generateEmployeeId,
  handleError,
} from "../utils/userHelper.js";

const CREATION_RULES: Record<UserRole, UserRole[]> = {
  [UserRole.ADMIN]: [UserRole.MANAGER, UserRole.TEAM_LEAD, UserRole.EMPLOYEE],
  [UserRole.MANAGER]: [UserRole.TEAM_LEAD, UserRole.EMPLOYEE],
  [UserRole.TEAM_LEAD]: [UserRole.EMPLOYEE],
  [UserRole.EMPLOYEE]: [],
};

async function getActorId(email: string): Promise<string | null> {
  const doc = await User.findOne({ email }).select("_id").lean();
  return doc ? String(doc._id) : null;
}

// ── Create user

export async function createUser(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const actor = req.user!;
    const body = req.body as CreateUserInput;

    // 1. Basic field validation
    const errors = validateCreateUser(body);
    if (errors.length) {
      res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
      return;
    }

    // Role-based creation permission
    const allowed = CREATION_RULES[actor.role] ?? [];
    if (!body.role || !allowed.includes(body.role)) {
      res.status(403).json({
        success: false,
        message: `A ${actor.role} cannot create a ${body.role ?? "user"}`,
      });
      return;
    }

    // 3. Resolve hierarchy fields
    let managerId: string | null = null;
    let teamLeadId: string | null = null;

    if (body.role === UserRole.TEAM_LEAD) {
      if (actor.role === UserRole.ADMIN) {
        if (!body.managerId) {
          res.status(400).json({
            success: false,
            message: "managerId is required when creating a Team Lead",
          });
          return;
        }
        const mgr = await User.findById(body.managerId).lean();
        if (!mgr || mgr.role !== UserRole.MANAGER) {
          res.status(400).json({
            success: false,
            message: "managerId does not belong to a Manager",
          });
          return;
        }
        managerId = String(body.managerId);
      } else {
        const actorId = await getActorId(actor.email);
        if (!actorId) {
          res.status(401).json({ success: false, message: "Session invalid" });
          return;
        }
        managerId = actorId;
      }
    } else if (body.role === UserRole.EMPLOYEE) {
      if (actor.role === UserRole.TEAM_LEAD) {
        const actorId = await getActorId(actor.email);
        if (!actorId) {
          res.status(401).json({ success: false, message: "Session invalid" });
          return;
        }
        teamLeadId = actorId;
        const tl = await User.findById(actorId).lean();
        managerId = tl?.managerId ? String(tl.managerId) : null;
      } else {
        // ADMIN or MANAGER: must supply teamLeadId
        if (!body.teamLeadId) {
          res.status(400).json({
            success: false,
            message: "teamLeadId is required when creating an Employee",
          });
          return;
        }
        const tl = await User.findById(body.teamLeadId).lean();
        if (!tl || tl.role !== UserRole.TEAM_LEAD) {
          res.status(400).json({
            success: false,
            message: "teamLeadId does not belong to a Team Lead",
          });
          return;
        }
        if (
          actor.role === UserRole.MANAGER &&
          String(tl.managerId) !== (await getActorId(actor.email))
        ) {
          res.status(403).json({
            success: false,
            message: "You can only assign employees to your own Team Leads",
          });
          return;
        }
        teamLeadId = String(tl._id);
        managerId = tl.managerId ? String(tl.managerId) : null;
      }
    }
    const dobDate = new Date(body.dob);
    const { floorNumber, landmark, ...requiredAddressFields } = body.address!;

    const employeeId = await generateEmployeeId({
      firstName: body.firstName!,
      lastName: body.lastName!,
      dob: dobDate,
      mobileNumber: body.mobileNumber,
    });

    const userData: IUser = {
      ...body,
      employeeId,
      dob: dobDate,
      managerId,
      teamLeadId,
      address: {
        ...requiredAddressFields,
        ...(floorNumber !== undefined && { floorNumber }),
        ...(landmark !== undefined && { landmark }),
      },
    };

    const user = await createUserService(userData);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (err) {
    handleError(res, err as AppError);
  }
}

// ── Get all users (scoped by role)

export async function getAllUsers(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const actor = req.user!;
    let filter: Record<string, unknown> = {};

    if (actor.role !== UserRole.ADMIN) {
      const actorId = await getActorId(actor.email);
      if (!actorId) {
        res.status(401).json({ success: false, message: "Session invalid" });
        return;
      }
      if (actor.role === UserRole.MANAGER) {
        filter = { managerId: actorId };
      } else if (actor.role === UserRole.TEAM_LEAD) {
        filter = { teamLeadId: actorId };
      } else if (actor.role === UserRole.EMPLOYEE) {
        filter = { _id: actorId };
      }
    }
    // ADMIN: no filter — returns all users

    const requestedRole = getQuery(
      req.query as Record<string, string | string[]>,
      "role",
    );
    if (requestedRole) {
      const allowedRoles = Object.values(UserRole) as string[];
      if (!allowedRoles.includes(requestedRole)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid role filter" });
        return;
      }
      filter = {
        ...filter,
        role: requestedRole,
      };
    }

    // Pagination parameters
    const page = parseInt(
      getQuery(req.query as Record<string, string | string[]>, "page") || "1",
      10,
    );
    const limit = parseInt(
      getQuery(req.query as Record<string, string | string[]>, "limit") || "10",
      10,
    );

    // Validate pagination params
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 100 ? limit : 10;

    // Get paginated users and total count
    const [users, totalCount] = await Promise.all([
      getAllUsersService(filter, { page: validPage, limit: validLimit }),
      getUsersCountService(filter),
    ]);

    const totalPages = Math.ceil(totalCount / validLimit);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: validPage,
        limit: validLimit,
        totalCount,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    });
  } catch (err) {
    handleError(res, err as AppError);
  }
}

// ── Get team leads filtered by manager

export async function getTeamLeadsByManager(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const actor = req.user!;
    const managerId = getQuery(
      req.query as Record<string, string | string[]>,
      "managerId",
    );

    if (!managerId) {
      res
        .status(400)
        .json({ success: false, message: "managerId is required" });
      return;
    }

    // Only admin and managers can access this endpoint
    if (actor.role === UserRole.MANAGER) {
      const actorId = await getActorId(actor.email);
      if (!actorId || actorId !== managerId) {
        res.status(403).json({
          success: false,
          message: "You can only view your own team leads",
        });
        return;
      }
    }

    const filter = {
      managerId,
      role: UserRole.TEAM_LEAD,
      status: "active",
    };

    // Pagination parameters
    const page = parseInt(
      getQuery(req.query as Record<string, string | string[]>, "page") || "1",
      10,
    );
    const limit = parseInt(
      getQuery(req.query as Record<string, string | string[]>, "limit") || "50",
      10,
    );

    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 100 ? limit : 50;

    // Get paginated team leads and total count
    const [teamLeads, totalCount] = await Promise.all([
      getAllUsersService(filter, { page: validPage, limit: validLimit }),
      getUsersCountService(filter),
    ]);

    const totalPages = Math.ceil(totalCount / validLimit);

    res.status(200).json({
      success: true,
      data: teamLeads,
      pagination: {
        page: validPage,
        limit: validLimit,
        totalCount,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    });
  } catch (err) {
    handleError(res, err as AppError);
  }
}

// ── Get user by ID

export async function getUserById(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const actor = req.user!;
    const id = getParam(req.params, "id");
    if (!id) {
      res.status(400).json({ success: false, message: "ID is required" });
      return;
    }

    const selectRaw = getQuery(
      req.query as Record<string, string | string[]>,
      "select",
    );
    const selectFields =
      selectRaw
        ?.split(",")
        .map((f) => f.trim())
        .filter(Boolean) ?? [];

    const user = await getUserByIdService({ id, selectFields });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const actorId =
      actor.role !== UserRole.ADMIN ? await getActorId(actor.email) : null;
    let canView =
      actor.role === UserRole.ADMIN ||
      String(user._id) === actorId ||
      (actor.role === UserRole.MANAGER && String(user.managerId) === actorId) ||
      (actor.role === UserRole.TEAM_LEAD &&
        String(user.teamLeadId) === actorId);

    // Allow a team lead to also view their own manager
    if (!canView && actor.role === UserRole.TEAM_LEAD && actorId) {
      const tlDoc = await User.findById(actorId).select("managerId").lean();
      if (tlDoc?.managerId && String(tlDoc.managerId) === String(user._id)) {
        canView = true;
      }
    }

    if (!canView) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to view this user",
      });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    handleError(res, err as AppError);
  }
}

// ── Update user ────────────────────────────────────────────────────────────────

type ImmutableFields = {
  firstName?: string;
  lastName?: string;
  dob?: string;
  mobileNumber?: string;
};

export async function updateUser(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    const actor = req.user!;
    const id = getParam(req.params, "id");
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "ID is required" });
    }

    const target = await User.findById(id).lean();
    if (!target) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Scope check
    const actorId =
      actor.role !== UserRole.ADMIN ? await getActorId(actor.email) : null;
    const canUpdate =
      actor.role === UserRole.ADMIN ||
      String(target._id) === actorId ||
      (actor.role === UserRole.MANAGER &&
        String(target.managerId) === actorId) ||
      (actor.role === UserRole.TEAM_LEAD &&
        String(target.teamLeadId) === actorId);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this user",
      });
    }

    const body = req.body as UpdateUserInput & ImmutableFields;
    const { firstName, lastName, dob, mobileNumber, ...allowedBody } = body;

    if (firstName || lastName || dob || mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: ["firstName, lastName, dob and mobileNumber cannot be updated"],
      });
    }

    // Only ADMIN can change role, managerId, or teamLeadId
    if (actor.role !== UserRole.ADMIN) {
      delete (allowedBody as Partial<IUser>).role;
      delete (allowedBody as Partial<IUser>).managerId;
      delete (allowedBody as Partial<IUser>).teamLeadId;
    }

    const errors = validateUpdateUser(allowedBody);
    if (errors.length) {
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }

    const data: Partial<IUser> = { ...allowedBody };

    if (allowedBody?.address) {
      const { floorNumber, landmark, ...requiredAddressFields } =
        allowedBody.address;
      data.address = {
        ...requiredAddressFields,
        ...(floorNumber !== undefined && { floorNumber }),
        ...(landmark !== undefined && { landmark }),
      };
    }

    const user = await updateUserService({ id, data });
    return res
      .status(200)
      .json({ success: true, message: "User updated", data: user });
  } catch (err) {
    return handleError(res, err as AppError);
  }
}

export async function transferEmployee(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    const actor = req.user!;
    const id = getParam(req.params, "id");
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Employee ID is required" });
    }

    const { teamLeadId: newTeamLeadId } = req.body as { teamLeadId?: string };
    if (!newTeamLeadId) {
      return res
        .status(400)
        .json({ success: false, message: "New teamLeadId is required" });
    }

    const employee = await User.findById(id).lean();
    if (!employee || employee.role !== UserRole.EMPLOYEE) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    const newTL = await User.findById(newTeamLeadId).lean();
    if (!newTL || newTL.role !== UserRole.TEAM_LEAD) {
      return res.status(400).json({
        success: false,
        message: "teamLeadId does not belong to a Team Lead",
      });
    }

    if (actor.role === UserRole.MANAGER) {
      const actorId = await getActorId(actor.email);
      if (
        !actorId ||
        String(employee.managerId) !== actorId ||
        String(newTL.managerId) !== actorId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only transfer employees between your own Team Leads",
        });
      }
    }

    const user = await transferEmployeeService({
      id,
      newTeamLeadId,
      newManagerId: newTL.managerId ? String(newTL.managerId) : null,
    });
    return res.status(200).json({
      success: true,
      message: "Employee transferred successfully",
      data: user,
    });
  } catch (err) {
    return handleError(res, err as AppError);
  }
}
