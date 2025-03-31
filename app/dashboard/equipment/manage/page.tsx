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
  condition: "new" | "good" | "fair" | "poor";
  location: string;
}

export default function ManageEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Form state for adding/editing equipment
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    availability: "available",
    quantity: 1,
    condition: "good", // Changed to lowercase to match enum
    location: "",
  });

  // Check if user is admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (session?.user?.role === "admin") {
      setIsAdmin(true);
    } else if (status !== "loading") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Fetch equipment data
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

    if (isAdmin) {
      fetchEquipment();
    }
  }, [isAdmin]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantity" ? parseInt(value) : value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      availability: "available",
      quantity: 1,
      condition: "good", // Changed to lowercase to match enum
      location: "",
    });
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEditEquipment = (item: Equipment) => {
    setFormData({
      name: item.name,
      category: item.category,
      availability: item.availability,
      quantity: item.quantity,
      condition: item.condition,
      location: item.location || "", // Include location field
    });
    setEditingId(item._id);
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = "/api/equipment";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save equipment");
      }

      // Refresh equipment list
      const updatedResponse = await fetch("/api/equipment");
      const updatedData = await updatedResponse.json();
      setEquipment(updatedData);

      // Reset form and show success message
      resetForm();
      setSuccess(
        editingId
          ? "Equipment updated successfully"
          : "Equipment added successfully"
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      setError(error.message || "An error occurred");
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="bg-red-900 text-red-100 border border-red-700 px-4 py-3 rounded-md"
        role="alert"
      >
        <span className="block sm:inline">
          You don't have permission to access this page.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6 rounded-lg space-y-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-purple-300">
          Manage Equipment
        </h1>
        <Link
          href="/dashboard"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white text-sm"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Form for adding/editing equipment */}
      <div className="bg-gray-800 shadow-md overflow-hidden sm:rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-medium mb-4 text-purple-300">
          {editingId ? "Edit Equipment" : "Add New Equipment"}
        </h2>

        {error && (
          <div
            className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded-md mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div
            className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-md mb-4"
            role="alert"
          >
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Equipment Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-300"
              >
                Category
              </label>
              <input
                type="text"
                name="category"
                id="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-300"
              >
                Storage Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="availability"
                className="block text-sm font-medium text-gray-300"
              >
                Availability
              </label>
              <select
                name="availability"
                id="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-300"
              >
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="condition"
                className="block text-sm font-medium text-gray-300"
              >
                Condition
              </label>
              <input
                type="text"
                name="condition"
                id="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex justify-center py-2 px-4 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {editingId ? "Update Equipment" : "Add Equipment"}
            </button>
          </div>
        </form>
      </div>

      {/* Equipment List */}
      <div className="bg-gray-800 shadow-md overflow-hidden sm:rounded-lg border border-gray-700">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-purple-300">
            Equipment Inventory
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-400">
            All equipment items available in the sports department.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Condition
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {equipment.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-400"
                  >
                    No equipment available. Add some above.
                  </td>
                </tr>
              ) : (
                equipment.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.condition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditEquipment(item)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
