"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "booking_status" | "reminder" | "waitlist" | "penalty" | "general";
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId,
          isRead: true,
        }),
      });

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });

      // Update local state
      setNotifications(
        notifications.filter(
          (notification) => notification._id !== notificationId
        )
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Load notifications when component mounts and session is available
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get notification type color
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "booking_status":
        return "bg-blue-900/20 border-blue-500/30";
      case "reminder":
        return "bg-green-900/20 border-green-500/30";
      case "waitlist":
        return "bg-yellow-900/20 border-yellow-500/30";
      case "penalty":
        return "bg-red-900/20 border-red-500/30";
      default:
        return "bg-purple-900/20 border-purple-500/30";
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (!session?.user) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        className="relative p-2 rounded-full hover:bg-gray-800 transition-colors"
        onClick={() => {
          setShowNotifications(!showNotifications);
          if (!showNotifications) {
            fetchNotifications();
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-accent rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-card-bg rounded-lg shadow-lg overflow-hidden z-50 border border-border-color">
          <div className="p-3 border-b border-border-color flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b border-border-color hover:bg-gray-800/30 transition-colors ${
                    !notification.isRead ? "bg-gray-800/20" : ""
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="font-medium text-sm">
                      {notification.title}
                    </div>
                    <div className="flex space-x-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-gray-400 hover:text-blue-400"
                          title="Mark as read"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-gray-400 hover:text-red-400"
                        title="Delete"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-300">
                    {notification.message}
                  </div>
                  <div
                    className={`mt-2 text-xs px-2 py-1 rounded ${getNotificationTypeColor(
                      notification.type
                    )}`}
                  >
                    {notification.type.replace("_", " ")}
                    <span className="float-right text-gray-400">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">
                No notifications
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-border-color">
              <button
                className="w-full py-2 btn-accent text-white text-sm rounded"
                onClick={() => {
                  // Mark all as read
                  notifications.forEach((notification) => {
                    if (!notification.isRead) {
                      markAsRead(notification._id);
                    }
                  });
                }}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
