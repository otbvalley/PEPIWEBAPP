import React, { useState, useEffect } from "react";
import { Mail, MessageCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { RiderNav } from "../component/RiderNav";

const RiderSupport: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <RiderNav />
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 sm:h-20">
            <button className="text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200 hover:scale-110">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title */}
        <div
          className={`mb-8 sm:mb-12 transform transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 mb-2">
            Support
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            We're here to help you 24/7
          </p>
        </div>

        {/* Order Issues Card */}
        <div
          className={`mb-8 sm:mb-12 transform transition-all duration-700 delay-100 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <div className="p-6 sm:p-8 lg:p-10 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700 mb-3 group-hover:text-green-600 transition-colors">
                  Order Issues
                </h2>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                  Report anything wrong with an order
                </p>
              </div>
              <div className="ml-4 sm:ml-6 relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 animate-pulse">
                  <AlertCircle
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div
          className={`transform transition-all duration-700 delay-200 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              PickItPickEat Support
            </h2>
            <p className="text-gray-600 mb-8 sm:mb-10 text-sm sm:text-base">
              Chat with PickItPickEat Customer care support
            </p>

            {/* Support Options */}
            <div className="space-y-4 sm:space-y-6">
              {/* Email Support */}
              <div className="group">
                <a
                  href="mailto:Support@PickItPickEat.com"
                  className="flex items-center p-5 sm:p-6 lg:p-7 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl sm:rounded-2xl hover:from-green-50 hover:to-emerald-50 transition-all duration-300 border-2 border-transparent hover:border-green-200 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="ml-4 sm:ml-6 flex-1">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-1">
                      Email PickItPickEat Support
                    </h3>
                    <p className="text-green-600 font-semibold text-sm sm:text-base group-hover:text-green-700 transition-colors">
                      Support@PickItPickEat.com
                    </p>
                  </div>
                  <div className="ml-2 text-green-600 group-hover:translate-x-2 transition-transform duration-300">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
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
                </a>
              </div>

              {/* WhatsApp Support */}
              <div className="group">
                <a
                  href="https://wa.me/2349012345678"
                  className="flex items-center p-5 sm:p-6 lg:p-7 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl sm:rounded-2xl hover:from-green-50 hover:to-emerald-50 transition-all duration-300 border-2 border-transparent hover:border-green-200 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="ml-4 sm:ml-6 flex-1">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-1">
                      Chat PickItPickEat Support on Whatsapp
                    </h3>
                    <p className="text-green-600 font-semibold text-sm sm:text-base group-hover:text-green-700 transition-colors">
                      +234 901 2345 678
                    </p>
                  </div>
                  <div className="ml-2 text-green-600 group-hover:translate-x-2 transition-transform duration-300">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
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
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Help Text */}
        <div
          className={`mt-8 sm:mt-12 text-center transform transition-all duration-700 delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <p className="text-gray-500 text-xs sm:text-sm">
            Need immediate assistance? Our team responds within minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiderSupport;
