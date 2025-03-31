"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

export default function ManageInfrastructurePage() {
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Form state for adding/editing infrastructure
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    availability: true,
    capacity: 1,
    operatingHours: {
      open: "06:00",
      close: "22:00",
    },
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

  // Fetch infrastructure data
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

    if (isAdmin) {
      fetchInfrastructure();
    }
  }, [isAdmin]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "open" || name === "close") {
      setFormData({
        ...formData,
        operatingHours: {
          ...formData.operatingHours,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]:
          name === "capacity"
            ? parseInt(value)
            : name === "availability"
            ? value === "true"
            : value,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      availability: true,
      capacity: 1,
      operatingHours: {
        open: "06:00",
        close: "22:00",
      },
    });
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEditInfrastructure = (item: Infrastructure) => {
    setFormData({
      name: item.name,
      location: item.location,
      availability: item.availability,
      capacity: item.capacity,
      operatingHours: {
        open: item.operatingHours.open,
        close: item.operatingHours.close,
      },
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
      const url = "/api/infrastructure";
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
        throw new Error(data.message || "Failed to save infrastructure");
      }

      // Refresh infrastructure list
      const updatedResponse = await fetch("/api/infrastructure");
      const updatedData = await updatedResponse.json();
      setInfrastructure(updatedData);

      // Reset form and show success message
      resetForm();
      setSuccess(
        editingId
          ? "Facility updated successfully"
          : "Facility added successfully"
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
          Manage Sports Facilities
        </h1>
        <Link
          href="/dashboard"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white text-sm"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Form for adding/editing infrastructure */}
      <div className="bg-gray-800 shadow-md overflow-hidden sm:rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-medium mb-4 text-purple-300">
          {editingId ? "Edit Facility" : "Add New Facility"}
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
                Facility Name
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
                htmlFor="location"
                className="block text-sm font-medium text-gray-300"
              >
                Location
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
                value={formData.availability.toString()}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="capacity"
                className="block text-sm font-medium text-gray-300"
              >
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                id="capacity"
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="open"
                className="block text-sm font-medium text-gray-300"
              >
                Opening Time
              </label>
              <input
                type="time"
                name="open"
                id="open"
                value={formData.operatingHours.open}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="close"
                className="block text-sm font-medium text-gray-300"
              >
                Closing Time
              </label>
              <input
                type="time"
                name="close"
                id="close"
                value={formData.operatingHours.close}
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
              {editingId ? "Update Facility" : "Add Facility"}
            </button>
          </div>
        </form>
      </div>

      {/* Infrastructure List */}
      <div className="bg-gray-800 shadow-md overflow-hidden sm:rounded-lg border border-gray-700">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-purple-300">
            Facility Inventory
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-400">
            All sports facilities managed by the sports department.
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
                  Capacity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Hours
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
              {infrastructure.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-400"
                  >
                    No facilities available. Add some above.
                  </td>
                </tr>
              ) : (
                infrastructure.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.availability
                            ? "bg-green-800 text-green-100"
                            : "bg-red-800 text-red-100"
                        }`}
                      >
                        {item.availability ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.operatingHours.open} - {item.operatingHours.close}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditInfrastructure(item)}
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
