import React, { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Bell,
  BarChart3,
  Clock,
  Calendar,
} from "lucide-react";
import { RiderNav } from "../component/RiderNav";
import { Link } from "react-router-dom";

type Screen = "home" | "ongoing" | "history" | "leaderboard";

const DailyRiderApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [direction, setDirection] = useState<"left" | "right">("right");

  const navigateTo = (screen: Screen, dir: "left" | "right" = "right") => {
    setDirection(dir);
    setTimeout(() => setCurrentScreen(screen), 50);
  };

  const getScreenIndex = (screen: Screen): number => {
    const order: Screen[] = ["home", "ongoing", "history", "leaderboard"];
    return order.indexOf(screen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-6xl bg-white rounded-3xl  overflow-hidden"
        style={{ height: "812px" }}
      >
        <RiderNav />
        {/* Header */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b">
          {currentScreen !== "home" && (
            <button
              onClick={() => {
                const screens: Screen[] = [
                  "home",
                  "ongoing",
                  "history",
                  "leaderboard",
                ];
                const currentIndex = screens.indexOf(currentScreen);
                if (currentIndex > 0) {
                  navigateTo(screens[currentIndex - 1], "left");
                }
              }}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {currentScreen === "home" && <div className="w-6"></div>}
          <h1 className="text-lg font-semibold flex-1 text-center">
            {currentScreen === "leaderboard"
              ? "Leaderboard"
              : "Daily rider games"}
          </h1>
          {currentScreen === "home" ? (
            <Link to="/rider-notifications">
              <Bell size={22} className="text-gray-700" />
            </Link>
          ) : (
            <BarChart3 size={22} className="text-gray-700" />
          )}
        </div>

        {/* Content Area */}
        <div
          className="relative overflow-hidden"
          style={{ height: "calc(812px - 112px)" }}
        >
          {/* Home Screen */}
          <div
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              currentScreen === "home"
                ? "translate-x-0 opacity-100"
                : direction === "right"
                ? "-translate-x-full opacity-0"
                : "translate-x-full opacity-0"
            }`}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-green-600" size={20} />
                <span className="text-green-600 font-semibold">Today</span>
                <ChevronRight size={16} className="text-green-600" />
              </div>

              <button
                onClick={() => navigateTo("leaderboard")}
                className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 p-3 rounded-xl">
                    <BarChart3 className="text-green-600" size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      View Leaderboard
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      See your current position against others
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-green-600" size={24} />
              </button>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 text-lg">
                    Daily Riders Games
                  </h2>
                  <span className="text-green-600 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full">
                    In Progress
                  </span>
                </div>

                <button
                  onClick={() => navigateTo("ongoing")}
                  className="w-full flex items-center justify-between mb-4 hover:bg-gray-50 rounded-xl p-3 -m-3 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="text-gray-400" size={20} />
                    <span className="text-gray-700 font-medium">
                      Entire Day
                    </span>
                  </div>
                  <ChevronRight className="text-green-600" size={24} />
                </button>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      At least 90 kilometers
                    </h3>
                    <span className="text-green-600 font-bold text-lg">
                      27%
                    </span>
                  </div>
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: "27%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ongoing Games Screen */}
          <div
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              currentScreen === "ongoing"
                ? "translate-x-0 opacity-100"
                : getScreenIndex(currentScreen) > getScreenIndex("ongoing")
                ? "-translate-x-full opacity-0"
                : "translate-x-full opacity-0"
            }`}
          >
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <button className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-green-600/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-600/40">
                  Ongoing Games
                </button>
                <button
                  onClick={() => navigateTo("history")}
                  className="flex-1 bg-white text-gray-600 font-semibold py-3 rounded-xl border border-gray-200 hover:border-green-600 hover:text-green-600 transition-all duration-300"
                >
                  Game History
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    At least 90 kilometers
                  </h3>
                  <span className="text-green-600 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full">
                    In Progress
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <Clock className="text-gray-400" size={18} />
                  <span className="text-gray-600 text-sm">Entire Day</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Prize</span>
                    <span className="text-green-600 font-bold text-lg">
                      27%
                    </span>
                  </div>
                  <h2 className="text-green-600 font-bold text-4xl">₦5,000</h2>
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-500 rounded-full"
                      style={{ width: "27%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* History Screen */}
          <div
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              currentScreen === "history"
                ? "translate-x-0 opacity-100"
                : getScreenIndex(currentScreen) > getScreenIndex("history")
                ? "-translate-x-full opacity-0"
                : "translate-x-full opacity-0"
            }`}
          >
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => navigateTo("ongoing", "left")}
                  className="flex-1 bg-white text-gray-600 font-semibold py-3 rounded-xl border border-gray-200 hover:border-green-600 hover:text-green-600 transition-all duration-300"
                >
                  Ongoing Games
                </button>
                <button className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-green-600/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-600/40">
                  Game History
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      At least 90 kilometers
                    </h3>
                    <span className="text-gray-600 text-sm font-medium">
                      20/11/2024
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="text-gray-400" size={16} />
                    <span className="text-gray-600 text-sm">
                      11:00am - 11:59pm
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-red-600 font-bold text-lg">
                        Lost
                      </span>
                      <span className="text-green-600 font-bold text-lg">
                        27%
                      </span>
                    </div>
                    <h2 className="text-red-600 font-bold text-2xl">N0</h2>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-500 rounded-full"
                        style={{ width: "27%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      At least 90 kilometers
                    </h3>
                    <span className="text-gray-600 text-sm font-medium">
                      19/11/2024
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="text-gray-400" size={16} />
                    <span className="text-gray-600 text-sm">
                      11:00am - 11:59pm
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-bold text-lg">
                        Won
                      </span>
                      <span className="text-green-600 font-bold text-lg">
                        27%
                      </span>
                    </div>
                    <h2 className="text-green-600 font-bold text-2xl">
                      ₦5,000
                    </h2>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-500 rounded-full"
                        style={{ width: "27%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Screen */}
          <div
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              currentScreen === "leaderboard"
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }`}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="text-green-600" size={20} />
                  <span className="text-green-600 font-semibold">Today</span>
                  <ChevronRight size={16} className="text-green-600" />
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-gray-500" size={20} />
                  <span className="text-gray-600 font-semibold">4th/1009</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-green-600 font-bold text-3xl">
                      11<span className="text-lg">km</span>
                    </h2>
                  </div>
                  <span className="text-green-600 font-bold text-2xl">27%</span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mt-3">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-500 rounded-full"
                    style={{ width: "27%" }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7].map((position) => (
                  <div
                    key={position}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                      position === 4
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                        : "bg-white shadow-sm border border-gray-100 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full ${
                          position === 4 ? "bg-white/20" : "bg-gray-200"
                        } flex items-center justify-center overflow-hidden`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${
                            position === 4 ? "bg-white/30" : "bg-gray-300"
                          }`}
                        ></div>
                      </div>
                      <div>
                        <h3
                          className={`font-semibold ${
                            position === 4 ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Abubakar Sadiq
                        </h3>
                        <p
                          className={`text-sm ${
                            position === 4 ? "text-white/80" : "text-gray-500"
                          }`}
                        >
                          5 Orders | 71.41km
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        position === 4 ? "text-white" : "text-green-600"
                      }`}
                    >
                      {position}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRiderApp;
