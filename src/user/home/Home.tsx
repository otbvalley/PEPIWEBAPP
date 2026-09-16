// import { Link } from "react-router-dom";
import logo from "../../assets/Logo SVG 1.png";
import React from "react";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop&q=80"
          alt="Food Background"
          className="w-full h-full object-cover"
        />
        {/* Multi-layer Gradient Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 to-transparent"></div>
      </div>

      {/* Animated Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>

      {/* Logo - Top Right */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20 animate-fadeIn">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-white font-bold text-xl hidden sm:block">
              PickIT PickEAT
            </span>
          </div>
        </div>
      </div>

      {/* Feature Cards - Floating on sides */}
      <div className="absolute left-4 top-1/4 z-10 hidden lg:block animate-slideInLeft">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl max-w-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Fast Delivery</p>
              <p className="text-white/80 text-sm">Under 30 minutes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-2/3 z-10 hidden lg:block animate-slideInRight">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl max-w-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Track Order</p>
              <p className="text-white/80 text-sm">Real-time updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Badge */}
        <div className="mb-8 animate-fadeInDown">
          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-full px-6 py-2 inline-flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white/90 text-sm font-medium">
              Available 24/7
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-12 animate-fadeInUp">
          <h1 className="text-white font-black text-center leading-tight mb-4">
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-2xl mb-2">
              Taking Orders for
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-green-400 via-green-300 to-green-400 bg-clip-text text-transparent drop-shadow-2xl">
              Fast Deliveries
            </span>
          </h1>
          <p className="text-white/90 text-center text-lg md:text-xl max-w-2xl mx-auto mt-6 drop-shadow-lg">
            Your favorite meals delivered hot and fresh to your doorstep
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-fadeInUp delay-200">
          <button className="group relative flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 overflow-hidden">
            <Link to="/signup">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          <button className="group relative flex-1 bg-white/10 backdrop-blur-md text-white font-bold py-4 px-8 rounded-2xl border-2 border-white/30 shadow-2xl hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300">
            <Link to="/login">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Login
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl w-full animate-fadeInUp delay-300">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
              500+
            </p>
            <p className="text-white/80 text-sm md:text-base mt-1">
              Restaurants
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
              10k+
            </p>
            <p className="text-white/80 text-sm md:text-base mt-1">
              Happy Users
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
              4.8★
            </p>
            <p className="text-white/80 text-sm md:text-base mt-1">
              Average Rating
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-0"></div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 1s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 1s ease-out;
        }

        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .delay-700 {
          animation-delay: 0.7s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Home;
