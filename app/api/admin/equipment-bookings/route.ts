import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import EquipmentBooking from "@/models/EquipmentBooking";
import Notification from "@/models/Notification";

export async function GET(request: Request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectToDB();

    // Fetch all equipment bookings with user and equipment details
    const bookings = await EquipmentBooking.find({})
      .populate({
        path: "user",
        select: "_id name email",
      })
      .populate({
        path: "equipment",
        select: "_id name category",
      })
      .sort({ createdAt: -1 });

    // Format the data for the frontend
    const formattedBookings = bookings.map((booking) => ({
      id: booking._id,
      userId: booking.user._id,
      userName: booking.user.name,
      equipmentId: booking.equipment._id,
      equipmentName: booking.equipment.name,
      quantity: booking.quantity,
      startTime: booking.startDate.toISOString(),
      endTime: booking.endDate.toISOString(),
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching equipment bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment bookings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "Booking ID and status are required" },
        { status: 400 }
      );
    }

    if (
      ![
        "pending",
        "approved",
        "rejected",
        "returned",
        "overdue",
        "canceled",
      ].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDB();

    // Update booking status
    const updatedBooking = await EquipmentBooking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    )
      .populate({
        path: "user",
        select: "_id name email",
      })
      .populate({
        path: "equipment",
        select: "_id name category",
      });

    if (!updatedBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Create a notification for the user
    await Notification.create({
      user: updatedBooking.user._id,
      type: "BOOKING_STATUS_CHANGE",
      message: `Your booking for ${updatedBooking.equipment.name} has been ${status}`,
      read: false,
    });

    return NextResponse.json({
      id: updatedBooking._id,
      userId: updatedBooking.user._id,
      userName: updatedBooking.user.name,
      equipmentId: updatedBooking.equipment._id,
      equipmentName: updatedBooking.equipment.name,
      quantity: updatedBooking.quantity,
      startTime: updatedBooking.startDate.toISOString(),
      endTime: updatedBooking.endDate.toISOString(),
      status: updatedBooking.status,
      createdAt: updatedBooking.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}
