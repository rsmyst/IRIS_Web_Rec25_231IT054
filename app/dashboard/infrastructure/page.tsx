"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Infrastructure {
  _id: string;
  name: string;
  location: string;
  availability: boolean;
  capacity: number;
  operatingHours: {
    open: string;
    close: string;
  };
}

export default function InfrastructurePage() {
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInfra, setSelectedInfra] = useState<Infrastructure | null>(
    null
  );
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch infrastructure data on component mount
  useEffect(() => {
    const fetchInfrastructure = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/infrastructure");

        if (!response.ok) {
          throw new Error("Failed to fetch infrastructure");
        }

        const data = await response.json();
        setInfrastructure(data);
      } catch (error: any) {
        setError(
          error.message || "An error occurred while fetching infrastructure"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInfrastructure();
  }, []);

  // Handle infrastructure booking
  const handleBookInfrastructure = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInfra) return;

    try {
      const response = await fetch("/api/infrastructure/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          infrastructureId: selectedInfra._id,
          date: bookingDate,
          startTime,
          endTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to book infrastructure");
      }

      // Close modal and navigate to bookings page
      setModalOpen(false);
      router.push("/dashboard/infrastructure/bookings");
    } catch (error: any) {
      setError(error.message || "An error occurred during booking");
    }
  };

  const openBookingModal = (item: Infrastructure) => {
    // Reset form and set selected infrastructure
    setSelectedInfra(item);
    setBookingDate("");
    setStartTime("");
    setEndTime("");
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError(null);
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString; // Can be enhanced to format time in a more user-friendly way
  };

  // Check if current time is within operating hours
  const isOpenNow = (operatingHours: { open: string; close: string }) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}`;

    return (
      currentTime >= operatingHours.open && currentTime <= operatingHours.close
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">
        Sports Facilities & Courts
      </h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infrastructure.map((item) => (
          <div
            key={item._id}
            className="bg-white shadow overflow-hidden sm:rounded-lg"
          >
            <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {item.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {item.location}
                </p>
              </div>
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.availability && isOpenNow(item.operatingHours)
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {item.availability && isOpenNow(item.operatingHours)
                  ? "Open Now"
                  : "Closed"}
              </span>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.availability
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.availability ? "Available" : "Unavailable"}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Capacity
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {item.capacity} people
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Operating Hours
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatTime(item.operatingHours.open)} -{" "}
                    {formatTime(item.operatingHours.close)}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="px-4 py-4 bg-white">
              <button
                onClick={() => openBookingModal(item)}
                disabled={!item.availability}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  item.availability
                    ? "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Book {item.name}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {modalOpen && selectedInfra && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Book {selectedInfra.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Operating Hours: {selectedInfra.operatingHours.open} -{" "}
                        {selectedInfra.operatingHours.close}
                      </p>
                    </div>
                    <div className="mt-4">
                      {error && (
                        <div
                          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                          role="alert"
                        >
                          <span className="block sm:inline">{error}</span>
                        </div>
                      )}

                      <form
                        onSubmit={handleBookInfrastructure}
                        className="space-y-4"
                      >
                        <div>
                          <label
                            htmlFor="bookingDate"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Date
                          </label>
                          <input
                            type="date"
                            name="bookingDate"
                            id="bookingDate"
                            min={new Date().toISOString().split("T")[0]}
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="startTime"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Start Time
                          </label>
                          <input
                            type="time"
                            name="startTime"
                            id="startTime"
                            min={selectedInfra.operatingHours.open}
                            max={selectedInfra.operatingHours.close}
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="endTime"
                            className="block text-sm font-medium text-gray-700"
                          >
                            End Time
                          </label>
                          <input
                            type="time"
                            name="endTime"
                            id="endTime"
                            min={startTime || selectedInfra.operatingHours.open}
                            max={selectedInfra.operatingHours.close}
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Submit Request
                          </button>
                          <button
                            type="button"
                            onClick={closeModal}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
