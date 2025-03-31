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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span className="block sm:inline">
          You don't have permission to access this page.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold mb-6">Manage Sports Facilities</h1>

      {/* Form for adding/editing infrastructure */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h2 className="text-xl font-medium mb-4">
          {editingId ? "Edit Facility" : "Add New Facility"}
        </h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
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
                className="block text-sm font-medium text-gray-700"
              >
                Facility Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="availability"
                className="block text-sm font-medium text-gray-700"
              >
                Availability
              </label>
              <select
                name="availability"
                id="availability"
                value={formData.availability.toString()}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="capacity"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="open"
                className="block text-sm font-medium text-gray-700"
              >
                Opening Time
              </label>
              <input
                type="time"
                name="open"
                id="open"
                value={formData.operatingHours.open}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="close"
                className="block text-sm font-medium text-gray-700"
              >
                Closing Time
              </label>
              <input
                type="time"
                name="close"
                id="close"
                value={formData.operatingHours.close}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingId ? "Update Facility" : "Add Facility"}
            </button>
          </div>
        </form>
      </div>

      {/* Infrastructure List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Facility Inventory
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            All sports facilities managed by the sports department.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
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
                    Capacity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hours
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
                {infrastructure.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No facilities available. Add some above.
                    </td>
                  </tr>
                ) : (
                  infrastructure.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.availability
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.availability ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.operatingHours.open} - {item.operatingHours.close}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditInfrastructure(item)}
                          className="text-indigo-600 hover:text-indigo-900"
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
    </div>
  );
}
