import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDB } from "@/lib/db";
import EquipmentBooking from "@/models/EquipmentBooking";
import Equipment from "@/models/Equipment";

// GET all bookings (admins see all, students see only their own)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    await connectToDB();

    // For admin users, return all bookings
    // For students, return only their own bookings
    const query =
      session.user.role === "admin" ? {} : { user: session.user.id };

    const bookings = await EquipmentBooking.find(query)
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

// POST to create new booking request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const body = await request.text();
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid JSON input" },
        { status: 400 }
      );
    }

    const { equipmentId, quantity, startTime, endTime } = parsedBody;

    // Validation
    if (!equipmentId || !quantity || !startTime || !endTime) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Check if equipment exists and has enough quantity
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return NextResponse.json(
        { message: "Equipment not found" },
        { status: 404 }
      );
    }

    if (equipment.availability !== "available") {
      return NextResponse.json(
        { message: `Equipment is currently ${equipment.availability}` },
        { status: 400 }
      );
    }

    if (equipment.quantity < quantity) {
      return NextResponse.json(
        { message: "Requested quantity exceeds available quantity" },
        { status: 400 }
      );
    }

    // Create booking request
    const booking = await EquipmentBooking.create({
      user: session.user.id,
      equipment: equipmentId,
      quantity,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: "pending",
    });

    // Populate booking with user and equipment details for response
    const populatedBooking = await EquipmentBooking.findById(booking._id)
      .populate("user", "name email")
      .populate("equipment", "name category");

    return NextResponse.json(
      {
        message: "Booking request submitted successfully",
        booking: populatedBooking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating equipment booking:", error);
    return NextResponse.json(
      { message: "Failed to create equipment booking" },
      { status: 500 }
    );
  }
}

// PUT to update booking status (approve/reject) - admin only
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
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

    // Update equipment availability if approving
    if (status === "approved" && booking.status !== "approved") {
      const equipment = await Equipment.findById(booking.equipment);
      if (equipment.quantity < booking.quantity) {
        return NextResponse.json(
          { message: "Not enough equipment available" },
          { status: 400 }
        );
      }

      // Reduce available quantity
      await Equipment.findByIdAndUpdate(booking.equipment, {
        $inc: { quantity: -booking.quantity },
      });
    }

    // Return equipment if status is changed to returned
    if (status === "returned" && booking.status === "approved") {
      await Equipment.findByIdAndUpdate(booking.equipment, {
        $inc: { quantity: booking.quantity },
      });
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
