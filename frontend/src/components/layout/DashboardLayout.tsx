import Sidebar from "./Sidebar";
import Header from "./Header";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
          <Header />
          <main className="flex-1 overflow-x-hidden p-6 md:p-8">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
