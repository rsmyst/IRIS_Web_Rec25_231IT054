import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDB } from "@/lib/db";
import EquipmentBooking from "@/models/EquipmentBooking";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET all equipment bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    await connectToDB();

    const bookings = await EquipmentBooking.find()
      .populate("user", "name email")
      .populate("equipment", "name category");

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching equipment bookings:", error);
    return NextResponse.json(
      { message: "Failed to fetch equipment bookings" },
      { status: 500 }
    );
  }
}

// PUT to update booking status (approve/reject) - admin only
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { bookingId, status, remarks } = await request.json();

    if (
      !bookingId ||
      !status ||
      !["approved", "rejected", "returned"].includes(status)
    ) {
      return NextResponse.json(
        { message: "Valid booking ID and status required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const booking = await EquipmentBooking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Update booking status
    const updatedBooking = await EquipmentBooking.findByIdAndUpdate(
      bookingId,
      { status, remarks },
      { new: true, runValidators: true }
    )
      .populate("user", "name email")
      .populate("equipment", "name category");

    return NextResponse.json(
      { message: `Booking ${status} successfully`, booking: updatedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating equipment booking:", error);
    return NextResponse.json(
      { message: "Failed to update equipment booking" },
      { status: 500 }
    );
  }
}
