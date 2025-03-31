"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    equipmentCount: 0,
    infrastructureCount: 0,
    equipmentBookings: 0,
    infrastructureBookings: 0,
  });

  useEffect(() => {
    if (session?.user?.role === "admin") {
      setIsAdmin(true);
    }

    // Fetch statistics data
    const fetchStats = async () => {
      try {
        // In a real application, these would be separate API calls
        // For now, we'll just simulate some data
        setStats({
          equipmentCount: 25,
          infrastructureCount: 8,
          equipmentBookings: 12,
          infrastructureBookings: 6,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [session]);

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">
          Welcome, {session?.user?.name}!
        </h2>
        <p className="text-gray-600">
          Use the navigation menu to manage sports equipment and infrastructure
          bookings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Equipment Items
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.equipmentCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                href="/dashboard/equipment"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all equipment <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sports Facilities
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.infrastructureCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                href="/dashboard/infrastructure"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all facilities <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    My Equipment Bookings
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.equipmentBookings}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                href="/dashboard/equipment/bookings"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all bookings <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    My Court Bookings
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.infrastructureBookings}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                href="/dashboard/infrastructure/bookings"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all bookings <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Equipment Management
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <Link
                href="/dashboard/equipment"
                className="block text-indigo-600 hover:text-indigo-500"
              >
                Browse available equipment
              </Link>
              <Link
                href="/dashboard/equipment/bookings"
                className="block text-indigo-600 hover:text-indigo-500"
              >
                View your equipment bookings
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/dashboard/equipment/manage"
                    className="block text-indigo-600 hover:text-indigo-500"
                  >
                    Manage equipment inventory
                  </Link>
                  <Link
                    href="/dashboard/admin/equipment-requests"
                    className="block text-indigo-600 hover:text-indigo-500"
                  >
                    Review equipment requests
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Facility Management
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <Link
                href="/dashboard/infrastructure"
                className="block text-indigo-600 hover:text-indigo-500"
              >
                Browse available facilities
              </Link>
              <Link
                href="/dashboard/infrastructure/bookings"
                className="block text-indigo-600 hover:text-indigo-500"
              >
                View your court bookings
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/dashboard/infrastructure/manage"
                    className="block text-indigo-600 hover:text-indigo-500"
                  >
                    Manage facilities
                  </Link>
                  <Link
                    href="/dashboard/admin/court-bookings"
                    className="block text-indigo-600 hover:text-indigo-500"
                  >
                    Review court booking requests
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
