import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import InfrastructureBooking from "@/models/InfrastructureBooking";
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

    // Fetch all court bookings with user and infrastructure details
    const bookings = await InfrastructureBooking.find({})
      .populate({
        path: "user",
        select: "_id name email",
      })
      .populate({
        path: "infrastructure",
        select: "_id name location",
      })
      .sort({ createdAt: -1 });

    // Format the data for the frontend
    const formattedBookings = bookings.map((booking) => {
      // Create a single datetime by combining date + time strings
      const startDateTime = new Date(booking.date);
      const [startHour, startMinute] = booking.startTime.split(":").map(Number);
      startDateTime.setHours(startHour, startMinute);

      const endDateTime = new Date(booking.date);
      const [endHour, endMinute] = booking.endTime.split(":").map(Number);
      endDateTime.setHours(endHour, endMinute);

      return {
        id: booking._id,
        userId: booking.user._id,
        userName: booking.user.name,
        infrastructureId: booking.infrastructure._id,
        infrastructureName: booking.infrastructure.name,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: booking.status,
        createdAt: booking.createdAt.toISOString(),
      };
    });

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching court bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch court bookings" },
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

    if (!["pending", "approved", "rejected", "canceled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDB();

    // Update booking status
    const updatedBooking = await InfrastructureBooking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    )
      .populate({
        path: "user",
        select: "_id name email",
      })
      .populate({
        path: "infrastructure",
        select: "_id name location",
      });

    if (!updatedBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Create a notification for the user
    await Notification.create({
      user: updatedBooking.user._id,
      type: "BOOKING_STATUS_CHANGE",
      message: `Your booking for ${updatedBooking.infrastructure.name} has been ${status}`,
      read: false,
    });

    // Format the response
    const startDateTime = new Date(updatedBooking.date);
    const [startHour, startMinute] = updatedBooking.startTime
      .split(":")
      .map(Number);
    startDateTime.setHours(startHour, startMinute);

    const endDateTime = new Date(updatedBooking.date);
    const [endHour, endMinute] = updatedBooking.endTime.split(":").map(Number);
    endDateTime.setHours(endHour, endMinute);

    return NextResponse.json({
      id: updatedBooking._id,
      userId: updatedBooking.user._id,
      userName: updatedBooking.user.name,
      infrastructureId: updatedBooking.infrastructure._id,
      infrastructureName: updatedBooking.infrastructure.name,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
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
