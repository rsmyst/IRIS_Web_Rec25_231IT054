"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface InfrastructureBooking {
  _id: string;
  infrastructure: {
    _id: string;
    name: string;
    location: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "rejected" | "canceled";
  remarks?: string;
  createdAt: string;
}

export default function InfrastructureBookingsPage() {
  const [bookings, setBookings] = useState<InfrastructureBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  // Fetch infrastructure booking data on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/infrastructure/booking");

        if (!response.ok) {
          throw new Error("Failed to fetch infrastructure bookings");
        }

        const data = await response.json();
        setBookings(data);
      } catch (error: any) {
        setError(
          error.message ||
            "An error occurred while fetching infrastructure bookings"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchBookings();
    }
  }, [session]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Function to determine status badge color
  const getStatusClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-800 text-green-100";
      case "pending":
        return "bg-yellow-800 text-yellow-100";
      case "rejected":
        return "bg-red-800 text-red-100";
      case "canceled":
        return "bg-gray-800 text-gray-300";
      default:
        return "bg-gray-800 text-gray-300";
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Confirm with user
      if (!confirm("Are you sure you want to cancel this booking?")) {
        return;
      }

      const response = await fetch("/api/infrastructure/booking", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          status: "canceled",
          remarks: "Canceled by user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel booking");
      }

      // Refresh bookings list
      const updatedResponse = await fetch("/api/infrastructure/booking");
      const updatedData = await updatedResponse.json();
      setBookings(updatedData);
    } catch (error: any) {
      setError(error.message || "An error occurred during cancellation");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Function to check if a booking is upcoming and can be canceled
  const canCancelBooking = (booking: InfrastructureBooking) => {
    return booking.status === "pending" || booking.status === "approved";
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6 rounded-lg">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-purple-300">
          My Court & Facility Bookings
        </h1>
        <Link
          href="/dashboard"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white text-sm"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div
          className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded-md mb-6"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-gray-800 shadow-md rounded-lg border border-gray-700 p-6 text-center">
          <p className="text-gray-400">
            You do not have any court or facility bookings yet.
          </p>
          <Link
            href="/dashboard/infrastructure"
            className="inline-block mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white"
          >
            Book a Court
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-md">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Facility
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Time Slot
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Remarks
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                    {booking.infrastructure?.name || "Unknown Facility"} <br />
                    <span className="text-xs text-gray-400">
                      {booking.infrastructure?.location}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(booking.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {booking.remarks || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {canCancelBooking(booking) && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 bg-gray-800 shadow-md rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-medium text-purple-300 mb-4">
          Looking for More Court Time?
        </h2>
        <p className="text-gray-400 mb-4">
          Browse our available courts and facilities to make a new booking.
        </p>
        <Link
          href="/dashboard/infrastructure"
          className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white"
        >
          View Available Courts
        </Link>
      </div>
    </div>
  );
}
