import "dotenv/config";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/users/User.js";
import { UserRole, UserStatus } from "../models/users/user.types.js";

const seedAdmin = async () => {
  await connectDB();

  const email = "admin@example.com";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin already exists → ${email}`);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await User.create({
    firstName: "Super",
    lastName: "Admin",
    email,
    password: hashedPassword,
    mobileNumber: "+911234567890",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    managerId: null,
    teamLeadId: null,
    address: {
      houseNumber: "1",
      street: "Admin Street",
      pincode: "110001",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
    },
  });

  console.log("✅ Admin seeded successfully!");
  console.log("   Email    : admin@example.com");
  console.log("   Password : Admin@123");
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Seeder failed:", err);
  process.exit(1);
});
