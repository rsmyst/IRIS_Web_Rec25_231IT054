"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Equipment {
  _id: string;
  name: string;
  category: string;
  availability: "available" | "unavailable" | "maintenance";
  quantity: number;
  condition: string;
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch equipment data on component mount
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        console.log("Fetching equipment from client...");
        const response = await fetch("/api/equipment");
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error("Failed to fetch equipment");
        }

        const data = await response.json();
        console.log("Equipment data received:", data);
        console.log(`Received ${data.length} equipment items`);
        setEquipment(data);
      } catch (error: any) {
        console.error("Error in equipment fetch:", error);
        setError(error.message || "An error occurred while fetching equipment");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  // Updated the POST request to include the current user's ID
  const handleBookEquipment = async (e: React.FormEvent) => {
    e.preventDefault();

    // console.log("Session data:", session);
    console.log("User data:", session?.user);

    // Check for user ID in various possible locations in the session object
    const userId = session?.user?.id;

    if (!selectedEquipment || !userId) {
      setError("User is not logged in or equipment is not selected.");
      return;
    }

    try {
      const response = await fetch("/api/equipment/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentId: selectedEquipment._id,
          quantity,
          startDate: startTime,
          endDate: endTime,
          userId: userId, // Use the extracted userId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to book equipment");
      }

      // Close modal and navigate to bookings page
      setModalOpen(false);
      router.push("/dashboard/equipment/bookings");
    } catch (error: any) {
      setError(error.message || "An error occurred during booking");
    }
  };

  const openBookingModal = (item: Equipment) => {
    // Reset form and set selected equipment
    setSelectedEquipment(item);
    setQuantity(1);
    setStartTime("");
    setEndTime("");
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError(null);
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
          Sports Equipment
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

      {equipment.length === 0 && !error && (
        <div className="bg-yellow-900 border border-yellow-700 text-yellow-100 px-4 py-3 rounded-md mb-6">
          <span className="block sm:inline">
            No equipment found. The database may be empty or there might be an
            issue with the connection.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <div
            key={item._id}
            className="bg-gray-800 shadow-md overflow-hidden rounded-lg border border-gray-700"
          >
            <div className="px-4 py-5 sm:px-6 bg-gray-800">
              <h3 className="text-lg leading-6 font-medium text-purple-300">
                {item.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-400">
                {item.category}
              </p>
            </div>
            <div className="border-t border-gray-700">
              <dl>
                <div className="bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-400">
                    Availability
                  </dt>
                  <dd className="mt-1 text-sm text-gray-300 sm:mt-0 sm:col-span-2">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.availability === "available"
                          ? "bg-green-800 text-green-100"
                          : item.availability === "maintenance"
                          ? "bg-yellow-800 text-yellow-100"
                          : "bg-red-800 text-red-100"
                      }`}
                    >
                      {item.availability}
                    </span>
                  </dd>
                </div>
                <div className="bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-300">
                    Quantity Available
                  </dt>
                  <dd className="mt-1 text-sm text-gray-100 sm:mt-0 sm:col-span-2">
                    {item.quantity}
                  </dd>
                </div>
                <div className="bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-400">
                    Condition
                  </dt>
                  <dd className="mt-1 text-sm text-gray-300 sm:mt-0 sm:col-span-2">
                    {item.condition}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="px-4 py-4 bg-gray-700">
              <button
                onClick={() => openBookingModal(item)}
                disabled={
                  item.availability !== "available" || item.quantity <= 0
                }
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  item.availability === "available" && item.quantity > 0
                    ? "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                Book Equipment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {modalOpen && selectedEquipment && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-700">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-purple-300"
                      id="modal-title"
                    >
                      Book {selectedEquipment.name}
                    </h3>
                    <div className="mt-4">
                      {error && (
                        <div
                          className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded-md mb-4"
                          role="alert"
                        >
                          <span className="block sm:inline">{error}</span>
                        </div>
                      )}

                      <form
                        onSubmit={handleBookEquipment}
                        className="space-y-4"
                      >
                        <div>
                          <label
                            htmlFor="quantity"
                            className="block text-sm font-medium text-gray-300"
                          >
                            Quantity (Max: {selectedEquipment.quantity})
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            min="1"
                            max={selectedEquipment.quantity}
                            value={quantity}
                            onChange={(e) =>
                              setQuantity(parseInt(e.target.value))
                            }
                            className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="startTime"
                            className="block text-sm font-medium text-gray-300"
                          >
                            Start Time
                          </label>
                          <input
                            type="datetime-local"
                            name="startTime"
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="endTime"
                            className="block text-sm font-medium text-gray-300"
                          >
                            End Time
                          </label>
                          <input
                            type="datetime-local"
                            name="endTime"
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                            required
                          />
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Submit Request
                          </button>
                          <button
                            type="button"
                            onClick={closeModal}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
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
