// import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo SVG 1.png";
import { User, Store, Bike, Shield } from "lucide-react";

export default function Select() {
  const options = [
    {
      label: "User",
      icon: User,
      description: "Order your favorite meals",
      row: "/user-home",
    },
    {
      label: "Vendor",
      icon: Store,
      description: "Manage your restaurant",
      row: "/vendor-login",
    },
    {
      label: "Rider",
      icon: Bike,
      description: "Deliver orders efficiently",
      row: "/onboarding",
    },
    {
      label: "Admin",
      icon: Shield,
      description: "System administration",
      row: "/admin-login",
    },
  ];
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white rounded-3xl shadow-lg p-6 mb-4">
            <img src={logo} alt="" />
          </div>
          <h1 className="text-green-600 text-2xl font-extrabold font-inter tracking-wide">
            PickEAT PickIT
          </h1>
          <p className="text-gray-600 mt-2 font-inter">
            Choose your role to continue
          </p>
        </div>

        {/* Button Selection */}
        <div className="space-y-4">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.label}
                className="group w-full bg-white hover:bg-green-50 border-2 border-gray-100 hover:border-green-500 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-xl transform hover:-translate-y-1"
                onClick={() => {
                  navigate(option.row);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 group-hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors duration-300">
                    <Icon className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-gray-800 font-inter group-hover:text-green-600 transition-colors">
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-500 font-inter">
                      {option.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
