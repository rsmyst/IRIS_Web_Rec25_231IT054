import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDB } from "@/lib/db";
import Equipment from "@/models/Equipment";

// GET all equipment
export async function GET() {
  try {
    await connectToDB();
    const equipment = await Equipment.find({});
    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      { message: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

// POST new equipment (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { name, category, availability, quantity, condition } =
      await request.json();

    // Validation
    if (!name || !category || !quantity || !condition) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const equipment = await Equipment.create({
      name,
      category,
      availability,
      quantity,
      condition,
    });

    return NextResponse.json(
      { message: "Equipment added successfully", equipment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding equipment:", error);
    return NextResponse.json(
      { message: "Failed to add equipment" },
      { status: 500 }
    );
  }
}

// PUT to update equipment (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id, name, category, availability, quantity, condition } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Equipment ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { name, category, availability, quantity, condition },
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return NextResponse.json(
        { message: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Equipment updated successfully", equipment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating equipment:", error);
    return NextResponse.json(
      { message: "Failed to update equipment" },
      { status: 500 }
    );
  }
}
