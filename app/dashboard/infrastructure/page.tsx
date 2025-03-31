"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  waitlistCount: number;
}

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
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [joinWaitlist, setJoinWaitlist] = useState(false);
  const [showWaitlistOption, setShowWaitlistOption] = useState(false);
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

  // Fetch available time slots when date and infrastructure are selected
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedInfra || !bookingDate) return;

      try {
        setCheckingAvailability(true);
        const response = await fetch(
          `/api/infrastructure/booking?date=${bookingDate}&infrastructureId=${selectedInfra._id}`,
          { method: "HEAD" }
        );

        if (!response.ok) {
          throw new Error("Failed to check availability");
        }

        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
      } catch (error: any) {
        setError(error.message || "Failed to check availability");
      } finally {
        setCheckingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedInfra, bookingDate]);

  // Handle infrastructure booking
  const handleBookInfrastructure = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInfra || !selectedSlot) return;

    try {
      const response = await fetch("/api/infrastructure/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          infrastructureId: selectedInfra._id,
          date: bookingDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          joinWaitlist,
        }),
      });

      const data = await response.json();

      // Handle waitlist option
      if (response.status === 409 && data.waitlistAvailable) {
        setShowWaitlistOption(true);
        setError(data.message);
        return;
      }

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

  const handleWaitlistOptionYes = () => {
    setJoinWaitlist(true);
    setShowWaitlistOption(false);
    // Re-submit the form with joinWaitlist=true
    handleBookInfrastructure(new Event("submit") as any);
  };

  const handleSlotSelection = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    // Reset waitlist related states
    setJoinWaitlist(false);
    setShowWaitlistOption(false);
    setError(null);
  };

  const openBookingModal = (item: Infrastructure) => {
    // Reset form and set selected infrastructure
    setSelectedInfra(item);
    setBookingDate("");
    setSelectedSlot(null);
    setAvailableSlots([]);
    setError(null);
    setModalOpen(true);
    setJoinWaitlist(false);
    setShowWaitlistOption(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError(null);
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return timeString;
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">
        Sports Facilities & Courts
      </h1>

      {error && !showWaitlistOption && (
        <div
          className="bg-red-900/30 border border-red-400/50 text-red-100 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infrastructure.map((item) => (
          <div
            key={item._id}
            className="card shadow overflow-hidden sm:rounded-lg"
          >
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-border-color">
              <div>
                <h3 className="text-lg leading-6 font-medium">{item.name}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-400">
                  {item.location}
                </p>
              </div>
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.availability && isOpenNow(item.operatingHours)
                    ? "bg-green-900/30 text-green-300"
                    : "bg-red-900/30 text-red-300"
                }`}
              >
                {item.availability && isOpenNow(item.operatingHours)
                  ? "Open Now"
                  : "Closed"}
              </span>
            </div>
            <div className="border-b border-border-color">
              <dl>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-400">Status</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.availability
                          ? "bg-green-900/30 text-green-300"
                          : "bg-red-900/30 text-red-300"
                      }`}
                    >
                      {item.availability ? "Available" : "Unavailable"}
                    </span>
                  </dd>
                </div>
                <div className="border-t border-border-color px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-400">
                    Capacity
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    {item.capacity} people
                  </dd>
                </div>
                <div className="border-t border-border-color px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-400">
                    Operating Hours
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    {formatTime(item.operatingHours.open)} -{" "}
                    {formatTime(item.operatingHours.close)}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="px-4 py-4">
              <button
                onClick={() => openBookingModal(item)}
                disabled={!item.availability}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  item.availability
                    ? "btn-accent hover:bg-accent-hover"
                    : "bg-gray-700 cursor-not-allowed"
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
              <div className="absolute inset-0 bg-black opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom modal-content rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium"
                      id="modal-title"
                    >
                      Book {selectedInfra.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        Operating Hours:{" "}
                        {formatTime(selectedInfra.operatingHours.open)} -{" "}
                        {formatTime(selectedInfra.operatingHours.close)}
                      </p>
                    </div>

                    {/* Show Waitlist Option Dialog */}
                    {showWaitlistOption && (
                      <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-md">
                        <p className="text-sm mb-3">{error}</p>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowWaitlistOption(false)}
                            className="py-1 px-3 border border-gray-600 rounded text-sm"
                          >
                            No, Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleWaitlistOptionYes}
                            className="py-1 px-3 btn-accent rounded text-sm"
                          >
                            Yes, Join Waitlist
                          </button>
                        </div>
                      </div>
                    )}

                    {!showWaitlistOption && (
                      <div className="mt-4">
                        {error && (
                          <div
                            className="bg-red-900/30 border border-red-400/50 text-red-100 px-4 py-3 rounded relative mb-4"
                            role="alert"
                          >
                            <span className="block sm:inline">{error}</span>
                          </div>
                        )}

                        <form className="space-y-4">
                          <div>
                            <label
                              htmlFor="bookingDate"
                              className="block text-sm font-medium text-gray-300"
                            >
                              Select Date
                            </label>
                            <input
                              type="date"
                              name="bookingDate"
                              id="bookingDate"
                              min={new Date().toISOString().split("T")[0]}
                              value={bookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                              className="mt-1 block w-full rounded-md py-2 px-3 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                              required
                            />
                          </div>

                          {bookingDate && (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Select a 1-hour Time Slot
                              </label>

                              {checkingAvailability ? (
                                <div className="flex justify-center my-4">
                                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
                                </div>
                              ) : availableSlots.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                                  {availableSlots.map((slot, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      onClick={() => handleSlotSelection(slot)}
                                      disabled={
                                        !slot.isAvailable && !joinWaitlist
                                      }
                                      className={`py-2 px-3 rounded-md text-sm font-medium text-center
                                        ${
                                          selectedSlot === slot
                                            ? "ring-2 ring-accent"
                                            : ""
                                        }
                                        ${
                                          slot.isAvailable
                                            ? "bg-green-900/30 text-green-100 hover:bg-green-900/50"
                                            : slot.waitlistCount > 0
                                            ? "bg-yellow-900/30 text-yellow-100"
                                            : "bg-red-900/30 text-red-100"
                                        }
                                        ${
                                          !slot.isAvailable && !joinWaitlist
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                        }
                                      `}
                                    >
                                      {formatTime(slot.startTime)} -{" "}
                                      {formatTime(slot.endTime)}
                                      {!slot.isAvailable &&
                                        slot.waitlistCount > 0 && (
                                          <span className="block text-xs mt-1">
                                            Waitlist: {slot.waitlistCount}
                                          </span>
                                        )}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400">
                                  No time slots available for the selected date.
                                </p>
                              )}
                            </div>
                          )}

                          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                              type="button"
                              disabled={!selectedSlot}
                              onClick={handleBookInfrastructure}
                              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white 
                                ${
                                  selectedSlot
                                    ? "btn-accent hover:bg-accent-hover"
                                    : "bg-gray-700 cursor-not-allowed"
                                } 
                                sm:ml-3 sm:w-auto sm:text-sm`}
                            >
                              Submit Request
                            </button>
                            <button
                              type="button"
                              onClick={closeModal}
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-transparent text-base font-medium hover:bg-gray-800 sm:mt-0 sm:w-auto sm:text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
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
