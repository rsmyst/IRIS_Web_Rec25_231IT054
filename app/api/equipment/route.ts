import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDB } from "@/lib/db";
import Equipment from "@/models/Equipment";

// GET all equipment
export async function GET() {
  try {
    await connectToDB();
    console.log("Fetching equipment...");
    const equipment = await Equipment.find({});
    console.log(
      `Found ${equipment.length} equipment items:`,
      equipment.map((item) => ({
        id: item._id,
        name: item.name,
        availability: item.availability,
      }))
    );
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

    const { name, category, availability, quantity, condition, location } =
      await request.json();

    // Validation
    if (!name || !category || !location) {
      return NextResponse.json(
        { message: "Name, category and location are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const equipment = await Equipment.create({
      name,
      category,
      availability: availability || "available",
      quantity: quantity || 1,
      condition: condition || "good",
      location,
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

    const { id, name, category, availability, quantity, condition, location } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Equipment ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    interface UpdateData {
      name?: string;
      category?: string;
      availability?: string;
      quantity?: number;
      condition?: string;
      location?: string;
    }

    const updateData: UpdateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (availability) updateData.availability = availability;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (condition) updateData.condition = condition;
    if (location) updateData.location = location;

    const equipment = await Equipment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

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

// DELETE equipment (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Equipment ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const equipment = await Equipment.findByIdAndDelete(id);

    if (!equipment) {
      return NextResponse.json(
        { message: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Equipment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return NextResponse.json(
      { message: "Failed to delete equipment" },
      { status: 500 }
    );
  }
}
