import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDB } from "@/lib/db";
import Infrastructure from "@/models/Infrastructure";

// GET all infrastructure
export async function GET() {
  try {
    await connectToDB();
    const infrastructures = await Infrastructure.find({});
    return NextResponse.json(infrastructures);
  } catch (error) {
    console.error("Error fetching infrastructure:", error);
    return NextResponse.json(
      { message: "Failed to fetch infrastructure" },
      { status: 500 }
    );
  }
}

// POST new infrastructure (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { name, location, availability, capacity, operatingHours } =
      await request.json();

    // Validation
    if (
      !name ||
      !location ||
      !capacity ||
      !operatingHours?.open ||
      !operatingHours?.close
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const infrastructure = await Infrastructure.create({
      name,
      location,
      availability,
      capacity,
      operatingHours,
    });

    return NextResponse.json(
      { message: "Infrastructure added successfully", infrastructure },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding infrastructure:", error);
    return NextResponse.json(
      { message: "Failed to add infrastructure" },
      { status: 500 }
    );
  }
}

// PUT to update infrastructure (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id, name, location, availability, capacity, operatingHours } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Infrastructure ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const infrastructure = await Infrastructure.findByIdAndUpdate(
      id,
      { name, location, availability, capacity, operatingHours },
      { new: true, runValidators: true }
    );

    if (!infrastructure) {
      return NextResponse.json(
        { message: "Infrastructure not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Infrastructure updated successfully", infrastructure },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating infrastructure:", error);
    return NextResponse.json(
      { message: "Failed to update infrastructure" },
      { status: 500 }
    );
  }
}
