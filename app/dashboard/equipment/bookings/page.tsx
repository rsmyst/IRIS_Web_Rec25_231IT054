"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface EquipmentBooking {
  _id: string;
  equipment: {
    _id: string;
    name: string;
    category: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  quantity: number;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected" | "returned";
  createdAt: string;
}

export default function EquipmentBookings() {
  const [bookings, setBookings] = useState<EquipmentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/equipment/booking");

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        console.log("Bookings data:", data); // Debug to see the actual data structure
        setBookings(data);
      } catch (error: any) {
        console.error("Error in bookings fetch:", error);
        setError(error.message || "An error occurred while fetching bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/equipment/booking/${bookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      // Remove the cancelled booking from state
      setBookings(bookings.filter((booking) => booking._id !== bookingId));
    } catch (error: any) {
      setError(error.message || "An error occurred while cancelling booking");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-800 text-green-100";
      case "rejected":
        return "bg-red-800 text-red-100";
      default:
        return "bg-yellow-800 text-yellow-100";
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6 rounded-lg">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-purple-300">
          My Equipment Bookings
        </h1>
        <Link
          href="/dashboard"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white text-sm"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-gray-800 shadow-md rounded-lg border border-gray-700 p-6 text-center">
          <p className="text-gray-400">
            You don't have any equipment bookings yet.
          </p>
          <Link
            href="/dashboard/equipment"
            className="inline-block mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white"
          >
            Book Equipment
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-md">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {booking.equipment?.name || "Unknown Equipment"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {booking.equipment?.category || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {booking.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(booking.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(booking.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(booking.startDate) > new Date() && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="text-red-400 hover:text-red-300 focus:outline-none"
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
          Need More Equipment?
        </h2>
        <p className="text-gray-400 mb-4">
          Browse our available equipment and make a new booking.
        </p>
        <Link
          href="/dashboard/equipment"
          className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white"
        >
          View Available Equipment
        </Link>
      </div>
    </div>
  );
}
