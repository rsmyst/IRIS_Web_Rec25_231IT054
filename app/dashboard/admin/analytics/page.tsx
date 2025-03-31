"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import chart components to prevent SSR issues
// Removed unused Chart import

const LineChart = dynamic(
  () =>
    import("react-chartjs-2").then((mod) => {
      return mod.Line;
    }),
  { ssr: false }
);

const DoughnutChart = dynamic(
  () =>
    import("react-chartjs-2").then((mod) => {
      return mod.Doughnut;
    }),
  { ssr: false }
);

const BarChart = dynamic(
  () =>
    import("react-chartjs-2").then((mod) => {
      return mod.Bar;
    }),
  { ssr: false }
);

interface Analytics {
  userRegistrations: {
    labels: string[];
    data: number[];
  };
  bookingsByType: {
    labels: string[];
    data: number[];
  };
  popularEquipment: {
    labels: string[];
    data: number[];
  };
  popularFacilities: {
    labels: string[];
    data: number[];
  };
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("week"); // week, month, year

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Use the real API endpoint instead of mock data
        const response = await axios.get(
          `/api/admin/analytics?period=${timeRange}`
        );
        setAnalytics(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data. Please try again later.");
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6 rounded-lg">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-purple-300">
          Analytics Dashboard
        </h1>
        <Link
          href="/dashboard"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white text-sm"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded-md text-sm ${
              timeRange === "week"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-md text-sm ${
              timeRange === "month"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-md text-sm ${
              timeRange === "year"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Last Year
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 text-white p-4 rounded-md mb-6">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-medium mb-4 text-purple-300">
                User Registrations
              </h2>
              <div className="h-64">
                <LineChart
                  data={{
                    labels: analytics.userRegistrations.labels,
                    datasets: [
                      {
                        label: "New Users",
                        data: analytics.userRegistrations.data,
                        borderColor: "rgba(147, 51, 234, 1)",
                        backgroundColor: "rgba(147, 51, 234, 0.2)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: "#CBD5E0",
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: "#CBD5E0",
                        },
                        grid: {
                          color: "rgba(160, 174, 192, 0.1)",
                        },
                      },
                      x: {
                        ticks: {
                          color: "#CBD5E0",
                        },
                        grid: {
                          color: "rgba(160, 174, 192, 0.1)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-medium mb-4 text-purple-300">
                Bookings by Type
              </h2>
              <div className="h-64">
                <DoughnutChart
                  data={{
                    labels: analytics.bookingsByType.labels,
                    datasets: [
                      {
                        data: analytics.bookingsByType.data,
                        backgroundColor: [
                          "rgba(147, 51, 234, 0.8)",
                          "rgba(79, 70, 229, 0.8)",
                        ],
                        borderColor: [
                          "rgba(147, 51, 234, 1)",
                          "rgba(79, 70, 229, 1)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: "#CBD5E0",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-medium mb-4 text-purple-300">
                Popular Equipment
              </h2>
              <div className="h-64">
                <BarChart
                  data={{
                    labels: analytics.popularEquipment.labels,
                    datasets: [
                      {
                        label: "Bookings",
                        data: analytics.popularEquipment.data,
                        backgroundColor: "rgba(147, 51, 234, 0.8)",
                        borderColor: "rgba(147, 51, 234, 1)",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: "#CBD5E0",
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: "#CBD5E0",
                        },
                        grid: {
                          color: "rgba(160, 174, 192, 0.1)",
                        },
                      },
                      x: {
                        ticks: {
                          color: "#CBD5E0",
                        },
                        grid: {
                          color: "rgba(160, 174, 192, 0.1)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-medium mb-4 text-purple-300">
                Popular Facilities
              </h2>
              <div className="h-64">
                <BarChart
                  data={{
                    labels: analytics.popularFacilities.labels,
                    datasets: [
                      {
                        label: "Bookings",
                        data: analytics.popularFacilities.data,
                        backgroundColor: "rgba(79, 70, 229, 0.8)",
                        borderColor: "rgba(79, 70, 229, 1)",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: "#CBD5E0",
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: "#CBD5E0",
                        },
                        grid: {
                          color: "rgba(160, 174, 192, 0.1)",
                        },
                      },
                      x: {
                        ticks: {
                          color: "#CBD5E0",
                        },
                        grid: {
                          color: "rgba(160, 174, 192, 0.1)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
