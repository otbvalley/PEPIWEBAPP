import { useState } from "react";
import { ChevronLeft, Bell, BellOff, Trash2, Check, Clock } from "lucide-react";
import { VendorNav } from "../component/VendorNav";

interface Notification {
  id: number;
  type: string;
  title: string;
  description: string;
  orderId: string;
  amount: string;
  time: string;
  date: string;
  image: string;
  isRead: boolean;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "booking",
      title: "New booking alert",
      description: "Rice, Plantain and Chicken.\nCheck it now>>",
      orderId: "5147",
      amount: "+$12.36",
      time: "9:00am",
      date: "31ST OCT 2023",
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
      isRead: false,
    },
    {
      id: 2,
      type: "booking",
      title: "New booking alert",
      description: "Rice, Plantain and Chicken.\nCheck it now>>",
      orderId: "5147",
      amount: "+$12.36",
      time: "9:00am",
      date: "31ST OCT 2023",
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
      isRead: false,
    },
    {
      id: 3,
      type: "booking",
      title: "New booking alert",
      description: "Rice, Plantain and Chicken.\nCheck it now>>",
      orderId: "5147",
      amount: "+$12.36",
      time: "9:00am",
      date: "31ST OCT 2023",
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
      isRead: true,
    },
    {
      id: 4,
      type: "booking",
      title: "New booking alert",
      description: "Rice, Plantain and Chicken.\nCheck it now>>",
      orderId: "5147",
      amount: "+$12.36",
      time: "9:00am",
      date: "31ST OCT 2023",
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
      isRead: true,
    },
  ]);

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const groupedNotifications = filteredNotifications.reduce((acc, notif) => {
    if (!acc[notif.date]) {
      acc[notif.date] = [];
    }
    acc[notif.date].push(notif);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <VendorNav />
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-95">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl font-semibold">Notification</h1>
            </div>
            <div className="relative">
              <Bell size={24} className="animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                filter === "all"
                  ? "bg-white text-green-600 shadow-md"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                filter === "unread"
                  ? "bg-white text-green-600 shadow-md"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Unread ({unreadCount})
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto px-4 py-2 rounded-lg font-medium bg-white/20 text-white hover:bg-white/30 transition-all duration-300 active:scale-95 flex items-center gap-2"
              >
                <Check size={16} />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg p-12 transform hover:scale-105 transition-all duration-300">
              <BellOff size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(
            ([date, notifs], groupIndex) => (
              <div key={date} className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={16} className="text-gray-400" />
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {date}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="space-y-3">
                  {notifs.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                        !notification.isRead
                          ? "ring-2 ring-green-500 ring-opacity-50"
                          : ""
                      }`}
                      style={{
                        animation: `slideIn 0.5s ease-out ${
                          (groupIndex * notifs.length + index) * 0.1
                        }s backwards`,
                      }}
                    >
                      <div className="flex items-start gap-4 p-4">
                        {/* Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={notification.image}
                            alt="Order"
                            className="w-16 h-16 rounded-xl object-cover shadow-md"
                          />
                          {!notification.isRead && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0 flex items-center gap-1">
                              <Clock size={12} />
                              {notification.time}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                            {notification.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Order ID:{" "}
                              <span className="font-semibold text-green-600">
                                {notification.orderId}
                              </span>
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              {notification.amount}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex border-t border-gray-100">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="flex-1 py-3 text-sm font-medium text-green-600 hover:bg-green-50 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                          >
                            <Check size={16} />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="flex-1 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
