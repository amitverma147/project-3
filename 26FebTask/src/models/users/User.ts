import mongoose, { Schema } from "mongoose";
import { UserRole, UserStatus } from "./user.types.js";
import type { IUser, Address } from "./user.types.js";

const AddressSchema = new Schema<Address>({
  houseNumber: { type: String, required: true, maxLength: 10 },
  street: { type: String, required: true },
  floorNumber: { type: String },
  landmark: { type: String },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
});

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.EMPLOYEE,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      required: true,
    },
    managerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    teamLeadId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    employeeId: { type: String, unique: true, sparse: true },
    dob: { type: Date },
    mobileNumber: { type: String, required: true, trim: true },
    address: { type: AddressSchema },
    aboutMe: { type: String, trim: true, maxLength: 50 },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
