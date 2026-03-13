"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user.service";
import { User } from "@/types/user";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [manager, setManager] = useState<User | null>(null);
  const [teamLead, setTeamLead] = useState<User | null>(null);

  useEffect(() => {
    const fetchRelatedUsers = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Fetch team lead if employee has teamLeadId
        if (currentUser.teamLeadId) {
          try {
            const { data: tlRes } = await userService.getById(
              currentUser.teamLeadId,
            );
            setTeamLead(tlRes.data ?? null);
          } catch {
            console.error("Failed to fetch team lead");
          }
        }

        // Fetch manager if user has managerId
        if (currentUser.managerId) {
          try {
            const { data: mgrRes } = await userService.getById(
              currentUser.managerId,
            );
            setManager(mgrRes.data ?? null);
          } catch {
            console.error("Failed to fetch manager");
          }
        }
      } catch {
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedUsers();
  }, [currentUser]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const displayName = currentUser
    ? `${currentUser.fname ?? currentUser.firstName ?? ""} ${currentUser.lname ?? currentUser.lastName ?? ""}`.trim() ||
      currentUser.username ||
      "User"
    : "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-medium text-white shrink-0">
              {initial}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {displayName}
              </h1>
              <p className="text-sm text-gray-500">
                {currentUser?.role?.replace("_", " ").toUpperCase()}
              </p>
              {currentUser?.employeeId && (
                <p className="text-xs text-gray-400 mt-1">
                  ID: {currentUser.employeeId}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Personal Information
              </h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900 font-medium">
                    {currentUser?.email ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Mobile Number</dt>
                  <dd className="text-gray-900 font-medium">
                    {currentUser?.mobileNumber ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Date of Birth</dt>
                  <dd className="text-gray-900 font-medium">
                    {currentUser?.dob
                      ? new Date(currentUser.dob).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </dd>
                </div>
                {currentUser?.username && (
                  <div>
                    <dt className="text-gray-500">Username</dt>
                    <dd className="text-gray-900 font-medium">
                      {currentUser.username}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        currentUser?.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {currentUser?.status ?? "—"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Address */}
            {currentUser?.address && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Address
                </h2>
                <address className="text-sm text-gray-900 not-italic space-y-1">
                  <p>{currentUser.address.houseNumber}</p>
                  <p>{currentUser.address.street}</p>
                  {currentUser.address.floorNumber && (
                    <p>Floor: {currentUser.address.floorNumber}</p>
                  )}
                  {currentUser.address.landmark && (
                    <p>Landmark: {currentUser.address.landmark}</p>
                  )}
                  <p>
                    {currentUser.address.city}, {currentUser.address.state}{" "}
                    {currentUser.address.pincode}
                  </p>
                  <p>{currentUser.address.country}</p>
                </address>
              </div>
            )}
          </div>
        </div>

        {/* Team Lead Information */}
        {teamLead && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Team Lead
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white shrink-0">
                {(
                  teamLead.firstName?.[0] ||
                  teamLead.fname?.[0] ||
                  "T"
                ).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {teamLead.firstName || teamLead.fname}{" "}
                  {teamLead.lastName || teamLead.lname}
                </p>
                <p className="text-xs text-gray-500">{teamLead.email}</p>
                {teamLead.mobileNumber && (
                  <p className="text-xs text-gray-500">
                    {teamLead.mobileNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manager Information */}
        {manager && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Manager
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-medium text-white shrink-0">
                {(
                  manager.firstName?.[0] ||
                  manager.fname?.[0] ||
                  "M"
                ).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {manager.firstName || manager.fname}{" "}
                  {manager.lastName || manager.lname}
                </p>
                <p className="text-xs text-gray-500">{manager.email}</p>
                {manager.mobileNumber && (
                  <p className="text-xs text-gray-500">
                    {manager.mobileNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* About Me */}
        {currentUser?.aboutMe && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              About Me
            </h2>
            <p className="text-sm text-gray-900">{currentUser.aboutMe}</p>
          </div>
        )}

        {/* Account Information */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Account Information
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-gray-500">Account Created</dt>
              <dd className="text-gray-700">
                {currentUser?.createdAt
                  ? new Date(currentUser.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Last Updated</dt>
              <dd className="text-gray-700">
                {currentUser?.updatedAt
                  ? new Date(currentUser.updatedAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </DashboardLayout>
  );
}
