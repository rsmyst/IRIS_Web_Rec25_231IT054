import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Equipment from "@/models/Equipment";
import EquipmentBooking from "@/models/EquipmentBooking";
import Infrastructure from "@/models/Infrastructure";
import InfrastructureBooking from "@/models/InfrastructureBooking";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectToDB();

    // Get period from query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";

    // Calculate date ranges based on period
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Format date labels based on the period
    const labels = generateDateLabels(startDate, now, period);

    // Get user registrations over time
    const userRegistrations = await getUserRegistrations(
      startDate,
      now,
      period
    );

    // Get bookings by type
    const bookingsByType = await getBookingsByType();

    // Get popular equipment
    const popularEquipment = await getPopularEquipment();

    // Get popular facilities
    const popularFacilities = await getPopularFacilities();

    return NextResponse.json({
      userRegistrations: {
        labels,
        data: userRegistrations,
      },
      bookingsByType: {
        labels: ["Equipment", "Infrastructure"],
        data: [bookingsByType.equipment, bookingsByType.infrastructure],
      },
      popularEquipment: {
        labels: popularEquipment.map((item) => item.name),
        data: popularEquipment.map((item) => item.count),
      },
      popularFacilities: {
        labels: popularFacilities.map((item) => item.name),
        data: popularFacilities.map((item) => item.count),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

// Helper function to generate date labels based on period
function generateDateLabels(
  startDate: Date,
  endDate: Date,
  period: string
): string[] {
  const labels = [];
  const current = new Date(startDate);

  switch (period) {
    case "week":
      // Daily labels for a week
      while (current <= endDate) {
        labels.push(
          current.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        );
        current.setDate(current.getDate() + 1);
      }
      break;

    case "month":
      // Weekly labels for a month
      while (current <= endDate) {
        labels.push(
          current.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        );
        current.setDate(current.getDate() + 7);
      }
      break;

    case "year":
      // Monthly labels for a year
      while (current <= endDate) {
        labels.push(current.toLocaleDateString("en-US", { month: "short" }));
        current.setMonth(current.getMonth() + 1);
      }
      break;

    default:
      while (current <= endDate) {
        labels.push(current.toLocaleDateString());
        current.setDate(current.getDate() + 1);
      }
  }

  return labels;
}

// Get user registrations over time
async function getUserRegistrations(
  startDate: Date,
  endDate: Date,
  period: string
) {
  const users = await User.find({
    createdAt: { $gte: startDate, $lte: endDate },
  }).sort({ createdAt: 1 });

  // Group users by date according to period
  const dateFormat =
    period === "year" ? "month" : period === "month" ? "week" : "day";
  const groupedData = {};

  users.forEach((user) => {
    let key;
    const date = new Date(user.createdAt);

    if (dateFormat === "day") {
      key = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (dateFormat === "week") {
      // Get the week start date
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (dateFormat === "month") {
      key = date.toLocaleDateString("en-US", { month: "short" });
    }

    if (!groupedData[key]) {
      groupedData[key] = 0;
    }
    groupedData[key]++;
  });

  // Generate the labels based on the period
  const labels = generateDateLabels(startDate, endDate, period);

  // Create the data array matching the labels
  return labels.map((label) => groupedData[label] || 0);
}

// Get bookings by type
async function getBookingsByType() {
  const equipmentBookingsCount = await EquipmentBooking.countDocuments();
  const infrastructureBookingsCount =
    await InfrastructureBooking.countDocuments();

  return {
    equipment: equipmentBookingsCount,
    infrastructure: infrastructureBookingsCount,
  };
}

// Get popular equipment
async function getPopularEquipment() {
  try {
    const bookings = await EquipmentBooking.aggregate([
      {
        $group: {
          _id: "$equipment",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "equipments",
          localField: "_id",
          foreignField: "_id",
          as: "equipmentData",
        },
      },
      { $unwind: "$equipmentData" },
      {
        $project: {
          name: "$equipmentData.name",
          count: 1,
          _id: 0,
        },
      },
    ]);

    return bookings.length > 0 ? bookings : [{ name: "No data", count: 0 }];
  } catch (error) {
    console.error("Error getting popular equipment:", error);
    return [{ name: "Error fetching data", count: 0 }];
  }
}

// Get popular facilities
async function getPopularFacilities() {
  try {
    const bookings = await InfrastructureBooking.aggregate([
      {
        $group: {
          _id: "$infrastructure",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "infrastructures",
          localField: "_id",
          foreignField: "_id",
          as: "infrastructureData",
        },
      },
      {
        $unwind: {
          path: "$infrastructureData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: { $ifNull: ["$infrastructureData.name", "Unknown"] },
          count: 1,
          _id: 0,
        },
      },
    ]);

    return bookings.length > 0 ? bookings : [{ name: "No data", count: 0 }];
  } catch (error) {
    console.error("Error getting popular facilities:", error);
    return [{ name: "Error fetching data", count: 0 }];
  }
}
