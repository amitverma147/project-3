import { User } from "@/types/user";

interface EmployeeTableProps {
  employees: User[];
  onEdit: (employee: User) => void;
  onView: (employee: User) => void;
}

export default function EmployeeTable({
  employees,
  onEdit,
  onView,
}: EmployeeTableProps) {
  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Employee ID</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Created Date</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr
                  key={emp._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 border-b border-gray-200">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-500 border-b border-gray-200">
                    {emp.email}
                  </td>
                  <td className="px-6 py-4 text-gray-500 border-b border-gray-200">
                    {emp.employeeId ?? "—"}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        emp.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {emp.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 border-b border-gray-200">
                    {formatDate(emp.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right border-b border-gray-200">
                    <button
                      onClick={() => onView(emp)}
                      className="text-gray-600 hover:text-gray-900 font-medium mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(emp)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
