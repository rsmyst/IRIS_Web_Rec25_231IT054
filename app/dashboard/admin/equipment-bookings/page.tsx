"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface EquipmentBooking {
  _id: string; // Updated to match the API response field
  userId: string;
  userName: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function ReviewEquipmentBookingRequests() {
  const [bookings, setBookings] = useState<EquipmentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/equipment-bookings");
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching equipment bookings:", err);
        setError("Failed to load equipment bookings. Please try again later.");
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Updated the function to use _id instead of id
  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await axios.put(`/api/admin/equipment-bookings`, { bookingId, status });
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status: status as "pending" | "approved" | "rejected",
              }
            : booking
        )
      );
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError("Failed to update booking status. Please try again.");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === "all") return true;
    return booking.status === statusFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6 rounded-lg">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-purple-300">
          Review Equipment Booking Requests
        </h1>
        <Link
          href="/dashboard"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white text-sm"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-900 text-white p-4 rounded-md mb-6">{error}</div>
      )}

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-300 block mb-2">
          Filter by Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center border border-gray-700">
          <p className="text-gray-400">No equipment booking requests found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Equipment
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
                  Requested On
                </th>
                <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {booking.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {booking.equipmentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {booking.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(booking.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(booking.endTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === "approved"
                          ? "bg-green-800 text-green-100"
                          : booking.status === "rejected"
                          ? "bg-red-800 text-red-100"
                          : "bg-yellow-800 text-yellow-100"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(booking.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateBookingStatus(booking._id, "approved")
                            }
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              updateBookingStatus(booking._id, "rejected")
                            }
                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status !== "pending" && (
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id, "pending")
                          }
                          className="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded-md text-xs"
                        >
                          Reset to Pending
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
