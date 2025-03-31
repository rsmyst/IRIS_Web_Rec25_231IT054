import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Equipment from "@/models/Equipment";
import Infrastructure from "@/models/Infrastructure";
import EquipmentBooking from "@/models/EquipmentBooking";
import InfrastructureBooking from "@/models/InfrastructureBooking";

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectToDB();

    const userId = session.user.id;
    const isAdmin = session.user.role === "admin";

    // Get equipment count
    const equipmentCount = await Equipment.countDocuments();

    // Get infrastructure count
    const infrastructureCount = await Infrastructure.countDocuments();

    // Get user's equipment bookings count
    let equipmentBookings;
    if (isAdmin) {
      equipmentBookings = await EquipmentBooking.countDocuments();
    } else {
      equipmentBookings = await EquipmentBooking.countDocuments({
        user: userId,
      });
    }

    // Get user's infrastructure bookings count
    let infrastructureBookings;
    if (isAdmin) {
      infrastructureBookings = await InfrastructureBooking.countDocuments();
    } else {
      infrastructureBookings = await InfrastructureBooking.countDocuments({
        user: userId,
      });
    }

    return NextResponse.json({
      equipmentCount,
      infrastructureCount,
      equipmentBookings,
      infrastructureBookings,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
