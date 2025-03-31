import { connectToDB } from "./db";
import Notification from "@/models/Notification";

/**
 * Service to handle creation and management of notifications
 */
export const NotificationService = {
  /**
   * Create a booking status notification
   */
  async createBookingStatusNotification(
    userId: string,
    bookingId: string,
    status: string,
    facilityName: string,
    bookingTime: string,
    bookingDate: string,
    bookingType: "InfrastructureBooking" | "EquipmentBooking"
  ) {
    await connectToDB();

    let title = "";
    let message = "";

    switch (status) {
      case "approved":
        title = `Booking Approved: ${facilityName}`;
        message = `Your booking for ${facilityName} on ${bookingDate} at ${bookingTime} has been approved.`;
        break;
      case "rejected":
        title = `Booking Rejected: ${facilityName}`;
        message = `Your booking for ${facilityName} on ${bookingDate} at ${bookingTime} has been rejected.`;
        break;
      case "canceled":
        title = `Booking Canceled: ${facilityName}`;
        message = `Your booking for ${facilityName} on ${bookingDate} at ${bookingTime} has been canceled.`;
        break;
      default:
        title = `Booking Update: ${facilityName}`;
        message = `Your booking for ${facilityName} on ${bookingDate} at ${bookingTime} has been updated to ${status}.`;
    }

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type: "booking_status",
      relatedBooking: bookingId,
      bookingType,
    });

    return notification;
  },

  /**
   * Create a reminder notification
   */
  async createReminderNotification(
    userId: string,
    bookingId: string,
    facilityName: string,
    bookingTime: string,
    bookingDate: string,
    scheduledFor: Date,
    bookingType: "InfrastructureBooking" | "EquipmentBooking"
  ) {
    await connectToDB();

    const notification = await Notification.create({
      user: userId,
      title: `Reminder: ${facilityName}`,
      message: `Your booking for ${facilityName} is scheduled for today at ${bookingTime}. Don't forget!`,
      type: "reminder",
      relatedBooking: bookingId,
      bookingType,
      scheduledFor,
      isSent: false,
    });

    return notification;
  },

  /**
   * Create a waitlist notification
   */
  async createWaitlistNotification(
    userId: string,
    bookingId: string,
    facilityName: string,
    bookingTime: string,
    bookingDate: string,
    waitlistPosition: number,
    bookingType: "InfrastructureBooking" | "EquipmentBooking"
  ) {
    await connectToDB();

    const notification = await Notification.create({
      user: userId,
      title: `Waitlist Update: ${facilityName}`,
      message: `You are now at position #${waitlistPosition} on the waitlist for ${facilityName} on ${bookingDate} at ${bookingTime}.`,
      type: "waitlist",
      relatedBooking: bookingId,
      bookingType,
    });

    return notification;
  },

  /**
   * Create a waitlist promotion notification
   */
  async createWaitlistPromotionNotification(
    userId: string,
    bookingId: string,
    facilityName: string,
    bookingTime: string,
    bookingDate: string,
    bookingType: "InfrastructureBooking" | "EquipmentBooking"
  ) {
    await connectToDB();

    const notification = await Notification.create({
      user: userId,
      title: `Booking Available: ${facilityName}`,
      message: `Good news! A spot has opened up for ${facilityName} on ${bookingDate} at ${bookingTime}. Your booking has been moved from the waitlist to pending approval.`,
      type: "waitlist",
      relatedBooking: bookingId,
      bookingType,
    });

    return notification;
  },

  /**
   * Create a penalty notification
   */
  async createPenaltyNotification(
    userId: string,
    penaltyHours: number,
    reason: string
  ) {
    await connectToDB();

    const notification = await Notification.create({
      user: userId,
      title: `Booking Restriction Applied`,
      message: `Due to ${reason}, you are restricted from making new bookings for the next ${penaltyHours} hours.`,
      type: "penalty",
    });

    return notification;
  },

  /**
   * Schedule a reminder for 30 minutes before booking
   */
  async scheduleBookingReminder(
    userId: string,
    bookingId: string,
    facilityName: string,
    bookingTime: string,
    bookingDate: string,
    dateObj: Date,
    bookingType: "InfrastructureBooking" | "EquipmentBooking"
  ) {
    // Create a date 30 minutes before the booking
    const reminderTime = new Date(dateObj);
    reminderTime.setMinutes(reminderTime.getMinutes() - 30);

    // Only schedule if the reminder time is in the future
    if (reminderTime > new Date()) {
      await this.createReminderNotification(
        userId,
        bookingId,
        facilityName,
        bookingTime,
        bookingDate,
        reminderTime,
        bookingType
      );
    }
  },

  /**
   * Get all unread notifications for a user
   */
  async getUnreadNotifications(userId: string) {
    await connectToDB();

    const notifications = await Notification.find({
      user: userId,
      isRead: false,
    }).sort({ createdAt: -1 });

    return notifications;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    await connectToDB();

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    return notification;
  },
};

export default NotificationService;
