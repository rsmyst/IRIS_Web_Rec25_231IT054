"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

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
        const response = await axios.get("/api/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [session]);

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6 rounded-lg">
      <h1 className="text-3xl font-semibold mb-6 text-purple-300">Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4 text-gray-200">
          Welcome, {session?.user?.name}!
        </h2>
        <p className="text-gray-400">
          Use the navigation menu to manage sports equipment and infrastructure
          bookings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 overflow-hidden shadow-md rounded-lg border border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-900 rounded-md p-3">
                <Image
                  src="/file.svg"
                  width={24}
                  height={24}
                  alt="Equipment"
                  className="h-6 w-6 text-white"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">
                  Total Equipment
                </dt>
                <dd className="text-lg font-semibold text-gray-200">
                  {stats.equipmentCount}
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 px-4 py-4 sm:px-6">
            <Link
              href="/dashboard/equipment"
              className="text-sm font-medium text-purple-300 hover:text-purple-200"
            >
              View all equipment
              <span className="ml-2" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 overflow-hidden shadow-md rounded-lg border border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-900 rounded-md p-3">
                <Image
                  src="/globe.svg"
                  width={24}
                  height={24}
                  alt="Infrastructure"
                  className="h-6 w-6 text-white"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">
                  Available Courts & Facilities
                </dt>
                <dd className="text-lg font-semibold text-gray-200">
                  {stats.infrastructureCount}
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 px-4 py-4 sm:px-6">
            <Link
              href="/dashboard/infrastructure"
              className="text-sm font-medium text-purple-300 hover:text-purple-200"
            >
              View all facilities
              <span className="ml-2" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 overflow-hidden shadow-md rounded-lg border border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-900 rounded-md p-3">
                <Image
                  src="/window.svg"
                  width={24}
                  height={24}
                  alt="Equipment Bookings"
                  className="h-6 w-6 text-white"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">
                  Equipment Bookings
                </dt>
                <dd className="text-lg font-semibold text-gray-200">
                  {stats.equipmentBookings}
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 px-4 py-4 sm:px-6">
            <Link
              href="/dashboard/equipment/bookings"
              className="text-sm font-medium text-purple-300 hover:text-purple-200"
            >
              View your bookings
              <span className="ml-2" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 overflow-hidden shadow-md rounded-lg border border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-900 rounded-md p-3">
                <Image
                  src="/globe.svg"
                  width={24}
                  height={24}
                  alt="Court Bookings"
                  className="h-6 w-6 text-white"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">
                  Court Bookings
                </dt>
                <dd className="text-lg font-semibold text-gray-200">
                  {stats.infrastructureBookings}
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 px-4 py-4 sm:px-6">
            <Link
              href="/dashboard/infrastructure/bookings"
              className="text-sm font-medium text-purple-300 hover:text-purple-200"
            >
              View your bookings
              <span className="ml-2" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 shadow-md overflow-hidden rounded-lg border border-gray-700">
        <div className="px-4 py-5 border-b border-gray-700 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-purple-300">
            Facility Management
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h4 className="text-md font-medium mb-3 text-gray-200">
                Sports Equipment
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                Browse and book available sports equipment for your activities
              </p>
              <Link
                href="/dashboard/equipment"
                className="inline-block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-sm text-white"
              >
                Browse Equipment
              </Link>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h4 className="text-md font-medium mb-3 text-gray-200">
                Courts & Facilities
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                Book sports courts and training facilities for teams and
                personal use
              </p>
              <Link
                href="/dashboard/infrastructure"
                className="inline-block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-sm text-white"
              >
                Browse Facilities
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div className="mt-8 bg-gray-800 shadow-md overflow-hidden rounded-lg border border-gray-700">
          <div className="px-4 py-5 border-b border-gray-700 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-purple-300">
              Admin Panel
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/dashboard/admin/users"
                className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600"
              >
                <h4 className="text-md font-medium mb-2 text-gray-200">
                  Manage Users
                </h4>
                <p className="text-xs text-gray-400">
                  View and manage user accounts and permissions
                </p>
              </Link>
              <Link
                href="/dashboard/admin/court-bookings"
                className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600"
              >
                <h4 className="text-md font-medium mb-2 text-gray-200">
                  Court Bookings
                </h4>
                <p className="text-xs text-gray-400">
                  Review and approve court booking requests
                </p>
              </Link>
              <Link
                href="/dashboard/admin/equipment-bookings"
                className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600"
              >
                <h4 className="text-md font-medium mb-2 text-gray-200">
                  Equipment Bookings
                </h4>
                <p className="text-xs text-gray-400">
                  Review and approve equipment booking requests
                </p>
              </Link>
              <Link
                href="/dashboard/admin/analytics"
                className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600"
              >
                <h4 className="text-md font-medium mb-2 text-gray-200">
                  Analytics
                </h4>
                <p className="text-xs text-gray-400">
                  View usage statistics and booking trends
                </p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
