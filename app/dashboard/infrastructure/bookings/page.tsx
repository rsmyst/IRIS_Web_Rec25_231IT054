"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "canceled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Function to check if a booking is upcoming and can be canceled
  const canCancelBooking = (booking: InfrastructureBooking) => {
    return booking.status === "pending" || booking.status === "approved";
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">
        My Court & Facility Bookings
      </h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <p className="text-gray-600">
            You don't have any court or facility bookings yet.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Facility
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time Slot
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Remarks
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.infrastructure?.name || "Unknown Facility"}{" "}
                      <br />
                      <span className="text-xs text-gray-500">
                        {booking.infrastructure?.location}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.remarks || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="text-red-600 hover:text-red-900"
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
        </div>
      )}
    </div>
  );
}
