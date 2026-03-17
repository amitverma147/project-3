import { z } from "zod";

const MOBILE_PATTERN = /^\d{10}$/;
const PINCODE_PATTERN = /^\d{6}$/;
const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export const getDobError = (dob: string): string | undefined => {
  if (!dob) return "Date of birth is required";

  const selectedDate = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(selectedDate.getTime())) return "Invalid date";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate > today) return "DOB cannot be in the future";

  const adultCutoff = new Date(today);
  adultCutoff.setFullYear(adultCutoff.getFullYear() - 18);

  if (selectedDate > adultCutoff) return "Age must be at least 18 years";

  return undefined;
};

const employeeCoreSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Required")
    .regex(EMAIL_PATTERN, "Invalid email"),
  mobileNumber: z
    .string()
    .trim()
    .min(1, "Required")
    .regex(MOBILE_PATTERN, "Enter 10 digit mobile number"),
  username: z.string().trim(),
  password: z.string(),
  teamLeadId: z.string(),
  dob: z.string().superRefine((value, ctx) => {
    const error = getDobError(value);
    if (error) {
      ctx.addIssue({ code: "custom", message: error });
    }
  }),
  address: z.object({
    houseNumber: z.string().trim().min(1, "House number is required"),
    street: z.string().trim().min(1, "Street is required"),
    country: z.string().trim().min(1, "Country is required"),
    state: z.string().trim().min(1, "State is required"),
    city: z.string().trim().min(1, "City is required"),
    pincode: z
      .string()
      .trim()
      .regex(PINCODE_PATTERN, "Pincode must be 6 digits"),
  }),
});

export const buildEmployeeSchema = (params?: {
  isEdit?: boolean;
  isTeamLeadRole?: boolean;
}) => {
  const isEdit = params?.isEdit ?? false;
  const isTeamLeadRole = params?.isTeamLeadRole ?? false;

  return employeeCoreSchema.superRefine((value, ctx) => {
    if (!isEdit && (!value.password || value.password.trim().length < 6)) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password must be at least 6 characters",
      });
    }

    if (!isTeamLeadRole && !value.teamLeadId?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["teamLeadId"],
        message: "Select a team lead",
      });
    }
  });
};

export const employeeSchema = buildEmployeeSchema();

export type EmployeeFormValues = z.infer<typeof employeeCoreSchema>;
