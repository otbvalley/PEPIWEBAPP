import { useState, useEffect } from "react";
import { Bell, ArrowLeft, Package, TrendingUp } from "lucide-react";
import { RiderNav } from "../component/RiderNav";

interface NotificationItem {
  type: "delivery" | "route";
  title: string;
  location: string;
  orderId: string;
  amount: string;
  time: string;
}

interface NotificationCardProps {
  notification: NotificationItem;
  index: number;
}

const NotificationCard = ({ notification, index }: NotificationCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`transform transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
        <div className="flex items-start gap-3">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 overflow-hidden ring-2 ring-white shadow-md">
              <img
                src="/api/placeholder/48/48"
                alt="Delivery"
                className="w-full h-full object-cover"
              />
            </div>
            {notification.type === "delivery" && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Package className="w-3 h-3 text-white" />
              </div>
            )}
            {notification.type === "route" && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {notification.title}
              </h3>
              <span className="text-xs text-gray-500 flex-shrink-0 font-medium">
                {notification.time}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-1.5 leading-relaxed">
              {notification.location}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                Order ID:{" "}
                <span className="text-emerald-600 font-semibold">
                  {notification.orderId}
                </span>
              </span>
              <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-50 to-emerald-100 px-2.5 py-1 rounded-full">
                <span className="text-emerald-600 font-bold text-sm">
                  +₦{notification.amount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DeliveryNotifications() {
  const [notifications] = useState([
    {
      id: 1,
      date: "31ST OCT 2023",
      items: [
        {
          type: "delivery" as const,
          title: "New delivery alert (Drop Off)",
          location: "Room 1, New boys hostel\nUniversity of Abuja.",
          orderId: "5147",
          amount: "12.36",
          time: "9:00am",
        },
        {
          type: "route" as const,
          title: "Change in route",
          location: "Room 1, New boys hostel\nUniversity of Abuja.",
          orderId: "5147",
          amount: "12.36",
          time: "9:00am",
        },
      ],
    },
    {
      id: 2,
      date: "31ST OCT 2023",
      items: [
        {
          type: "delivery" as const,
          title: "New delivery alert (Drop Off)",
          location: "Room 1, New boys hostel\nUniversity of Abuja.",
          orderId: "5147",
          amount: "12.36",
          time: "9:00am",
        },
        {
          type: "route" as const,
          title: "Change in route",
          location: "Room 1, New boys hostel\nUniversity of Abuja.",
          orderId: "5147",
          amount: "12.36",
          time: "9:00am",
        },
      ],
    },
  ]);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Header */}
      <RiderNav />
      <div
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrollY > 10 ? "bg-white/95 backdrop-blur-lg shadow-md" : "bg-white"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Notification</h1>
            <button className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 relative">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-8">
        {notifications.map((section, sectionIndex) => (
          <div key={section.id} className="mb-8">
            {/* Date Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              <h2 className="text-xs font-bold text-gray-500 tracking-wider uppercase px-3 py-1 bg-white rounded-full shadow-sm">
                {section.date}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>

            {/* Notification Cards */}
            <div className="space-y-3">
              {section.items.map((notification, index) => (
                <NotificationCard
                  key={index}
                  notification={notification}
                  index={sectionIndex * section.items.length + index}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-4 sm:right-8 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-2xl hover:shadow-emerald-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group">
        <Bell className="w-6 h-6 text-white group-hover:animate-pulse" />
      </button>
    </div>
  );
}
