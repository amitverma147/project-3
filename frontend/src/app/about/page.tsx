"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0 gap-1 sm:gap-0">
      <span className="sm:w-40 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className="text-sm text-gray-800">{value || "—"}</span>
    </div>
  );
}

export default function AboutPage() {
  const { user } = useAuth();

  const displayName = user ? `${user.fname} ${user.lname}`.trim() : "—";
  const initial = displayName.charAt(0).toUpperCase();

  const address = user?.address
    ? [
        user.address.houseNumber,
        user.address.street,
        user.address.city,
        user.address.state,
        user.address.pincode,
        user.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Avatar + name banner */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {initial}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {displayName}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
            <span className="mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 uppercase tracking-wider">
              {user?.role?.replace("_", " ") ?? "—"}
            </span>
          </div>
        </div>

        {/* Profile details */}
        <div className="bg-white rounded-lg border border-gray-200 px-6 py-2">
          <h3 className="text-sm font-semibold text-gray-700 py-3 border-b border-gray-100">
            Profile Details
          </h3>
          <Row label="Employee ID" value={user?.employeeId} />
          <Row label="Username" value={user?.username} />
          <Row label="First Name" value={user?.fname} />
          <Row label="Last Name" value={user?.lname} />
          <Row label="Email" value={user?.email} />
          <Row label="Mobile" value={user?.mobileNumber} />
          <Row
            label="Date of Birth"
            value={user?.dob ? new Date(user.dob).toLocaleDateString() : null}
          />
          <Row label="Status" value={user?.status} />
          <Row label="Address" value={address} />
          {user?.aboutMe && <Row label="About Me" value={user.aboutMe} />}
        </div>
      </div>
    </DashboardLayout>
  );
}
