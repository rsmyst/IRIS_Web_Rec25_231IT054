"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
        const response = await fetch("/api/equipment");

        if (!response.ok) {
          throw new Error("Failed to fetch equipment");
        }

        const data = await response.json();
        setEquipment(data);
      } catch (error: any) {
        setError(error.message || "An error occurred while fetching equipment");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  // Handle equipment booking
  const handleBookEquipment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEquipment) return;

    try {
      const response = await fetch("/api/equipment/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentId: selectedEquipment._id,
          quantity,
          startTime,
          endTime,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Equipment</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <div
            key={item._id}
            className="bg-white shadow overflow-hidden sm:rounded-lg"
          >
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {item.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {item.category}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Availability
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.availability === "available"
                          ? "bg-green-100 text-green-800"
                          : item.availability === "maintenance"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.availability}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Quantity Available
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {item.quantity}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Condition
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {item.condition}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="px-4 py-4 bg-white">
              <button
                onClick={() => openBookingModal(item)}
                disabled={
                  item.availability !== "available" || item.quantity <= 0
                }
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  item.availability === "available" && item.quantity > 0
                    ? "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    : "bg-gray-300 cursor-not-allowed"
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
                      Book {selectedEquipment.name}
                    </h3>
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
                        onSubmit={handleBookEquipment}
                        className="space-y-4"
                      >
                        <div>
                          <label
                            htmlFor="quantity"
                            className="block text-sm font-medium text-gray-700"
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
                            type="datetime-local"
                            name="startTime"
                            id="startTime"
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
                            type="datetime-local"
                            name="endTime"
                            id="endTime"
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
