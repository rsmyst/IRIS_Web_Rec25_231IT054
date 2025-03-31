import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDB } from "@/lib/db";
import Notification from "@/models/Notification";

// Get all notifications for the currently logged in user
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    await connectToDB();

    // Find all notifications for this user
    const notifications = await Notification.find({
      user: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const { notificationId, isRead = true } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { message: "Notification ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Find and update the notification
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: session.user.id },
      { isRead },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { message: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// Create notification (admin or system only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (
      !session?.user ||
      (session.user.role !== "admin" && session.user.role !== "system")
    ) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const notification = await request.json();

    if (
      !notification.user ||
      !notification.title ||
      !notification.message ||
      !notification.type
    ) {
      return NextResponse.json(
        { message: "Missing required notification fields" },
        { status: 400 }
      );
    }

    await connectToDB();

    const newNotification = await Notification.create(notification);

    return NextResponse.json(
      { message: "Notification created", notification: newNotification },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { message: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const notificationId = url.searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { message: "Notification ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Delete the notification (users can only delete their own)
    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      user: session.user.id,
    });

    if (!result) {
      return NextResponse.json(
        {
          message:
            "Notification not found or you don't have permission to delete it",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { message: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
