"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Notifications from "@/components/Notifications";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [counts, setCounts] = useState({
    equipment: 0,
    infrastructure: 0,
    bookings: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [equipmentRes, infrastructureRes, bookingsRes] =
          await Promise.all([
            fetch("/api/equipment"),
            fetch("/api/infrastructure"),
            fetch("/api/equipment/booking"),
          ]);

        if (equipmentRes.ok && infrastructureRes.ok && bookingsRes.ok) {
          const equipmentData = await equipmentRes.json();
          const infrastructureData = await infrastructureRes.json();
          const bookingsData = await bookingsRes.json();

          setCounts({
            equipment: equipmentData.length || 0,
            infrastructure: infrastructureData.length || 0,
            bookings: bookingsData.length || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    if (session?.user) {
      fetchCounts();
    }
  }, [session]);

  // Show loading state when session is loading
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Redirect if no session
  if (!session?.user) {
    return null;
  }

  const isAdmin = session.user.role === "admin";

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-card-bg border-r border-border-color flex flex-col">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-lg font-semibold">IRIS Booking System</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase mb-2">
              General
            </h3>
            <ul>
              <li className="mb-1">
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase mb-2">
              Equipment
            </h3>
            <ul>
              <li className="mb-1">
                <Link
                  href="/dashboard/equipment"
                  className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                >
                  Book Equipment ({counts.equipment})
                </Link>
              </li>
              <li className="mb-1">
                <Link
                  href="/dashboard/equipment/bookings"
                  className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                >
                  My Equipment Bookings
                </Link>
              </li>
              {isAdmin && (
                <li className="mb-1">
                  <Link
                    href="/dashboard/equipment/manage"
                    className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                  >
                    Manage Equipment
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase mb-2">
              Infrastructure
            </h3>
            <ul>
              <li className="mb-1">
                <Link
                  href="/dashboard/infrastructure"
                  className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                >
                  Book Infrastructure ({counts.infrastructure})
                </Link>
              </li>
              <li className="mb-1">
                <Link
                  href="/dashboard/infrastructure/bookings"
                  className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                >
                  My Infrastructure Bookings
                </Link>
              </li>
              {isAdmin && (
                <li className="mb-1">
                  <Link
                    href="/dashboard/infrastructure/manage"
                    className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                  >
                    Manage Infrastructure
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {isAdmin && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 uppercase mb-2">
                Admin
              </h3>
              <ul>
                <li className="mb-1">
                  <Link
                    href="/dashboard/admin/analytics"
                    className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                  >
                    Analytics Dashboard
                  </Link>
                </li>
                <li className="mb-1">
                  <Link
                    href="/dashboard/admin/users"
                    className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                  >
                    Manage Users
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-border-color">
          <p className="text-sm text-gray-400">
            Logged in as{" "}
            <span className="text-accent">{session.user.name}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">{session.user.email}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card-bg border-b border-border-color">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Notifications />
              <Link
                href="/api/auth/signout"
                className="btn-accent px-4 py-2 text-sm rounded-md"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
