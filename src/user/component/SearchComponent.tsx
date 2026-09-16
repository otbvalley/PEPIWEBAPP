import React, { useState } from "react";
import {
  Search,
  ChevronLeft,
  Filter,
  Clock,
  Star,
  Heart,
  Bell,
} from "lucide-react";
import { Navbar } from "../../component/Navbar";

type Category = "All" | "Breakfast" | "Stock" | "Desert";

type FoodCategory = {
  id: string;
  name: string;
  image: string;
};

type Restaurant = {
  id: string;
  name: string;
  image: string;
  rating: number;
  arrivalTime: string;
  deliveryFee: string;
  isFreeDelivery: boolean;
};

const SearchComponent: React.FC = () => {
  const [activeView, setActiveView] = useState<"search" | "results">("search");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories: Category[] = ["All", "Breakfast", "Stock", "Desert"];

  const foodCategories: FoodCategory[] = [
    {
      id: "1",
      name: "Rice",
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    },
    {
      id: "2",
      name: "BBQ",
      image:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    },
    {
      id: "3",
      name: "Fish",
      image:
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop",
    },
    {
      id: "4",
      name: "Pasta",
      image:
        "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
    },
    {
      id: "5",
      name: "Deserts",
      image:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
    },
    {
      id: "6",
      name: "Breakfast",
      image:
        "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop",
    },
  ];

  const restaurants: Restaurant[] = [
    {
      id: "1",
      name: "GreenVita",
      image:
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200&h=200&fit=crop",
      rating: 4.7,
      arrivalTime: "15 - 20 mins",
      deliveryFee: "Free Delivery",
      isFreeDelivery: true,
    },
    {
      id: "2",
      name: "Anauco",
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop",
      rating: 4.7,
      arrivalTime: "10 mins",
      deliveryFee: "Delivery Fee • $2.34",
      isFreeDelivery: false,
    },
    {
      id: "3",
      name: "Parking pizza",
      image:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop",
      rating: 4.7,
      arrivalTime: "20 - 30 mins",
      deliveryFee: "Delivery Fee • $1.99",
      isFreeDelivery: false,
    },
    {
      id: "4",
      name: "Sushi shop",
      image:
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop",
      rating: 4.7,
      arrivalTime: "20 mins",
      deliveryFee: "Free Delivery",
      isFreeDelivery: true,
    },
    {
      id: "5",
      name: "Foc i Oli",
      image:
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&h=200&fit=crop",
      rating: 4.7,
      arrivalTime: "20 mins",
      deliveryFee: "Free Delivery",
      isFreeDelivery: true,
    },
    {
      id: "6",
      name: "Pafinolis",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop",
      rating: 4.7,
      arrivalTime: "20 mins",
      deliveryFee: "Delivery Fee • $2.34",
      isFreeDelivery: false,
    },
  ];

  const toggleFavorite = (id: string): void => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const SearchView: React.FC = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header with Status Bar */}
      <div className="bg-white">
        <Navbar />

        <div className="px-4 py-4 flex items-center justify-between">
          <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Search</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Search Bar with Shadow */}
      <div className="bg-white px-4 pt-2 pb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="What you craving for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-green-600 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <button className="px-4 py-3.5 text-green-600 font-semibold flex items-center gap-2 border-2 border-gray-100 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all">
            <span className="text-sm">Filter</span>
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white px-4 py-4 flex gap-3 overflow-x-auto border-b border-gray-100 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              selectedCategory === category
                ? "bg-green-600 text-white shadow-lg shadow-green-600/30 scale-105"
                : "bg-white text-gray-600 border-2 border-gray-200 hover:border-green-600 hover:text-green-600"
            }`}
          >
            {selectedCategory === category && <span className="mr-1">✓</span>}
            {category}
          </button>
        ))}
      </div>

      {/* Food Categories Grid */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3  gap-4">
          {foodCategories.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveView("results")}
              className="relative rounded-2xl overflow-hidden h-48 group shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute inset-0 flex items-end justify-center pb-6">
                <h3 className="text-white text-2xl font-bold drop-shadow-2xl tracking-wide">
                  {item.name}
                </h3>
              </div>
              <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ResultsView: React.FC = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-24">
      <Navbar />
      {/* Header with Status Bar */}
      <div className="bg-white">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setActiveView("search")}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Search</h1>
          <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell className="w-6 h-6 text-gray-900" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 pt-2 pb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for available home services"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-green-600 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <button className="px-4 py-3.5 text-green-600 font-semibold flex items-center gap-2 border-2 border-gray-100 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all">
            <span className="text-sm">Filter</span>
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white px-4 py-4 flex gap-3 overflow-x-auto border-b border-gray-100 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              selectedCategory === category
                ? "bg-green-600 text-white shadow-lg shadow-green-600/30 scale-105"
                : "bg-white text-gray-600 border-2 border-gray-200 hover:border-green-600 hover:text-green-600"
            }`}
          >
            {selectedCategory === category && <span className="mr-1">✓</span>}
            {category}
          </button>
        ))}
      </div>

      {/* Restaurant List */}
      <div className="p-5 space-y-4">
        {restaurants.map((restaurant, index) => (
          <div
            key={restaurant.id}
            className="bg-white rounded-2xl p-4 flex gap-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-24 h-24 rounded-xl object-cover shadow-sm"
              />
              {restaurant.isFreeDelivery && (
                <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  FREE
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-green-600 text-green-600" />
                        <span className="text-sm font-bold text-gray-900">
                          {restaurant.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          {restaurant.arrivalTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(restaurant.id)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <Heart
                      className={`w-6 h-6 transition-all ${
                        favorites.has(restaurant.id)
                          ? "fill-red-500 text-red-500 scale-110"
                          : "text-gray-300 hover:text-red-500"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${
                    restaurant.isFreeDelivery
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {restaurant.deliveryFee}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
    </div>
  );

  return activeView === "search" ? <SearchView /> : <ResultsView />;
};

export default SearchComponent;
