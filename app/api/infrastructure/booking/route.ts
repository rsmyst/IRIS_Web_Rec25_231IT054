import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDB } from "@/lib/db";
import InfrastructureBooking from "@/models/InfrastructureBooking";
import Infrastructure from "@/models/Infrastructure";

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

    // Extract query parameters
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const infrastructureId = url.searchParams.get("infrastructureId");

    // Build base query
    let query: any = session.user.role === "admin" ? {} : { user: session.user.id };

    // Add date filter if provided
    if (date) {
      const bookingDate = new Date(date);
      query.date = {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
      };
    }

    // Add infrastructure filter if provided
    if (infrastructureId) {
      query.infrastructure = infrastructureId;
    }

    const bookings = await InfrastructureBooking.find(query)
      .populate("user", "name email")
      .populate("infrastructure", "name location")
      .sort({ waitlistPosition: 1, createdAt: 1 });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching infrastructure bookings:", error);
    return NextResponse.json(
      { message: "Failed to fetch infrastructure bookings" },
      { status: 500 }
    );
  }
}

// Get availability for a specific infrastructure and date
export async function HEAD(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const infrastructureId = url.searchParams.get("infrastructureId");

    if (!date || !infrastructureId) {
      return NextResponse.json(
        { message: "Date and infrastructureId are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const bookingDate = new Date(date);
    
    // Get the infrastructure details
    const infrastructure = await Infrastructure.findById(infrastructureId);
    if (!infrastructure) {
      return NextResponse.json(
        { message: "Infrastructure not found" },
        { status: 404 }
      );
    }

    // Get all bookings for this infrastructure on this date
    const bookings = await InfrastructureBooking.find({
      infrastructure: infrastructureId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
      },
      status: { $in: ["pending", "approved"] },
    }).sort('startTime');

    // Generate available time slots
    const [openHour, openMinute] = infrastructure.operatingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = infrastructure.operatingHours.close.split(':').map(Number);
    
    let availableSlots = [];
    let currentHour = openHour;
    let currentMinute = openMinute;

    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const endHour = currentMinute === 0 ? currentHour + 1 : currentHour;
      const endMinute = currentMinute === 0 ? 0 : currentMinute;
      
      // Format as HH:MM
      const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      // Check if this slot is booked
      const isBooked = bookings.some(booking => booking.startTime === startTime);
      
      availableSlots.push({
        startTime,
        endTime,
        isAvailable: !isBooked,
        waitlistCount: isBooked ? bookings.filter(b => b.startTime === startTime && b.waitlistPosition !== undefined).length : 0
      });
      
      // Move to next hour
      currentHour++;
    }

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { message: "Failed to check availability" },
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

    const { infrastructureId, date, startTime, endTime, joinWaitlist } = await request.json();

    // Validation
    if (!infrastructureId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Check if infrastructure exists and is available
    const infrastructure = await Infrastructure.findById(infrastructureId);
    if (!infrastructure) {
      return NextResponse.json(
        { message: "Infrastructure not found" },
        { status: 404 }
      );
    }

    if (!infrastructure.availability) {
      return NextResponse.json(
        { message: "This facility is currently unavailable" },
        { status: 400 }
      );
    }

    // Check if user already has a booking for this date (one booking per day rule)
    const bookingDate = new Date(date);
    const existingBooking = await InfrastructureBooking.findOne({
      user: session.user.id,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          message:
            "You already have a booking for this date. Only one booking per day is allowed.",
        },
        { status: 400 }
      );
    }

    // Check if the slot is already booked
    const slotBooked = await InfrastructureBooking.findOne({
      infrastructure: infrastructureId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
      },
      startTime,
      status: { $in: ["pending", "approved"] },
      waitlistPosition: null, // Only count primary bookings, not waitlist entries
    });

    // If slot is booked and user doesn't want to join waitlist, return error
    if (slotBooked && !joinWaitlist) {
      return NextResponse.json(
        { 
          message: "This slot is already booked. Would you like to join the waitlist?",
          waitlistAvailable: true
        },
        { status: 409 }
      );
    }

    let waitlistPosition = null;
    
    // If slot is booked and user wants to join waitlist
    if (slotBooked && joinWaitlist) {
      // Find the highest waitlist position for this slot
      const highestWaitlist = await InfrastructureBooking.findOne({
        infrastructure: infrastructureId,
        date: {
          $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
          $lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
        },
        startTime,
      }).sort({ waitlistPosition: -1 });

      waitlistPosition = highestWaitlist?.waitlistPosition 
        ? highestWaitlist.waitlistPosition + 1 
        : 1;
    }

    // Create booking request
    const booking = await InfrastructureBooking.create({
      user: session.user.id,
      infrastructure: infrastructureId,
      date: new Date(date),
      startTime,
      endTime,
      status: "pending",
      waitlistPosition
    });

    // Populate booking with user and infrastructure details for response
    const populatedBooking = await InfrastructureBooking.findById(booking._id)
      .populate("user", "name email")
      .populate("infrastructure", "name location");

    return NextResponse.json(
      {
        message: waitlistPosition !== null
          ? `You have been added to the waitlist at position #${waitlistPosition}`
          : "Booking request submitted successfully",
        booking: populatedBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating infrastructure booking:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create infrastructure booking" },
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
      !["approved", "rejected", "canceled"].includes(status)
    ) {
      return NextResponse.json(
        { message: "Valid booking ID and status required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const booking = await InfrastructureBooking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Update booking status
    const updatedBooking = await InfrastructureBooking.findByIdAndUpdate(
      bookingId,
      { status, remarks },
      { new: true, runValidators: true }
    )
      .populate("user", "name email")
      .populate("infrastructure", "name location");
      
    // If a booking was canceled or rejected and it wasn't on waitlist,
    // promote the first waitlisted booking to pending status
    if ((status === "canceled" || status === "rejected") && !booking.waitlistPosition) {
      const waitlistBooking = await InfrastructureBooking.findOne({
        infrastructure: booking.infrastructure,
        date: booking.date,
        startTime: booking.startTime,
        waitlistPosition: { $ne: null },
      }).sort({ waitlistPosition: 1 });
      
      if (waitlistBooking) {
        await InfrastructureBooking.findByIdAndUpdate(
          waitlistBooking._id,
          { 
            waitlistPosition: null, 
            status: "pending",
            remarks: "Promoted from waitlist"
          }
        );
        
        // Here you would send a notification that they've been promoted from waitlist
        // This will be implemented in the notification system
      }
    }

    return NextResponse.json(
      { message: `Booking ${status} successfully`, booking: updatedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating infrastructure booking:", error);
    return NextResponse.json(
      { message: "Failed to update infrastructure booking" },
      { status: 500 }
    );
  }
}
