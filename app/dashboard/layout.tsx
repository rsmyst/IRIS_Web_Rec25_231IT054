"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (session?.user?.role === "admin") {
      setIsAdmin(true);
    }
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-indigo-700">
          <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white text-2xl font-bold">NITK Sports</h1>
            </div>
            <nav className="mt-8 flex-1 px-2 bg-indigo-700 space-y-2">
              <Link
                href="/dashboard"
                className="text-white group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-indigo-600"
              >
                Dashboard
              </Link>

              <div className="mt-4 pt-4 border-t border-indigo-800">
                <h3 className="px-3 text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                  Equipment
                </h3>
                <div className="mt-2 space-y-1">
                  <Link
                    href="/dashboard/equipment"
                    className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-indigo-600"
                  >
                    View Equipment
                  </Link>
                  <Link
                    href="/dashboard/equipment/bookings"
                    className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-indigo-600"
                  >
                    My Equipment Bookings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/dashboard/equipment/manage"
                      className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-indigo-600"
                    >
                      Manage Equipment
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-indigo-800">
                <h3 className="px-3 text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                  Infrastructure
                </h3>
                <div className="mt-2 space-y-1">
                  <Link
                    href="/dashboard/infrastructure"
                    className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-indigo-600"
                  >
                    View Courts & Facilities
                  </Link>
                  <Link
                    href="/dashboard/infrastructure/bookings"
                    className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-indigo-600"
                  >
                    My Court Bookings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/dashboard/infrastructure/manage"
                      className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-indigo-600"
                    >
                      Manage Infrastructure
                    </Link>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-indigo-800">
                  <h3 className="px-3 text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                    Administration
                  </h3>
                  <div className="mt-2 space-y-1">
                    <Link
                      href="/dashboard/admin/equipment-requests"
                      className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-indigo-600"
                    >
                      Equipment Requests
                    </Link>
                    <Link
                      href="/dashboard/admin/court-bookings"
                      className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-indigo-600"
                    >
                      Court Booking Requests
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </div>
          <div className="flex-shrink-0 flex bg-indigo-700 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-indigo-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Sign Out</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">
                  Sports Infrastructure Management
                </h2>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center">
                <span className="text-gray-700 mr-2">
                  {user?.name || session?.user?.name}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                  {isAdmin ? "Admin" : "Student"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
