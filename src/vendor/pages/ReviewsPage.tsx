import { useState } from "react";
import { Star, ChevronLeft, ThumbsUp, MessageSquare } from "lucide-react";
import { VendorNav } from "../component/VendorNav";

const ReviewsPage = () => {
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set());

  const reviews = [
    {
      id: 1,
      name: "Alex K.",
      initials: "AK",
      date: "Jan 20, 2024",
      rating: 5,
      text: "I love the meal it was great, and yeah the delivery was fast",
      likes: 12,
      replies: 2,
    },
    {
      id: 2,
      name: "Alex K.",
      initials: "AK",
      date: "Jan 20, 2024",
      rating: 5,
      text: "I love the meal it was great, and yeah the delivery was fast",
      likes: 8,
      replies: 1,
    },
    {
      id: 3,
      name: "Sarah M.",
      initials: "SM",
      date: "Jan 19, 2024",
      rating: 4,
      text: "Great food quality and packaging. Delivery took a bit longer than expected but overall satisfied.",
      likes: 15,
      replies: 3,
    },
    {
      id: 4,
      name: "John D.",
      initials: "JD",
      date: "Jan 18, 2024",
      rating: 5,
      text: "Absolutely amazing! The flavors were incredible and portion sizes were perfect. Will definitely order again!",
      likes: 24,
      replies: 5,
    },
  ];

  const ratingData = [
    { stars: 5, count: 488, percentage: 84.6 },
    { stars: 4, count: 74, percentage: 12.8 },
    { stars: 3, count: 14, percentage: 2.4 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  const toggleLike = (id: number) => {
    setLikedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const totalReviews = 578;
  const averageRating = 4.7;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <VendorNav />
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-95">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">Reviews</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Rating Overview Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 transform hover:scale-[1.02] transition-all duration-300">
          <h2 className="text-gray-800 font-semibold mb-4 text-lg">Reviews</h2>

          <div className="flex items-end gap-6 mb-6">
            <div className="flex-shrink-0">
              <div className="text-6xl font-bold text-gray-900 mb-2 animate-fade-in">
                {averageRating}
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    className={`${
                      star <= Math.floor(averageRating)
                        ? "fill-green-500 text-green-500"
                        : star - 0.5 <= averageRating
                        ? "fill-green-500 text-green-500 opacity-50"
                        : "text-gray-300"
                    } transition-all duration-300`}
                    style={{
                      animationDelay: `${star * 100}ms`,
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">({totalReviews} Reviews)</p>
            </div>

            <div className="flex-1 space-y-3">
              {ratingData.map((rating, index) => (
                <div
                  key={rating.stars}
                  className="flex items-center gap-3 group"
                >
                  <span className="text-sm text-gray-600 w-12">
                    {rating.stars} stars
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${rating.percentage}%`,
                        animationDelay: `${index * 100}ms`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-10 text-right font-medium">
                    {rating.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{
                animation: `slideIn 0.5s ease-out ${index * 0.1}s backwards`,
              }}
            >
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md">
                  {review.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {review.name}
                    </h3>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= review.rating
                            ? "fill-green-500 text-green-500"
                            : "text-gray-300"
                        } transition-all duration-300`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {review.text}
                  </p>

                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => toggleLike(review.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        likedReviews.has(review.id)
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      } active:scale-95`}
                    >
                      <ThumbsUp
                        size={16}
                        className={
                          likedReviews.has(review.id) ? "fill-current" : ""
                        }
                      />
                      <span className="text-sm font-medium">
                        {review.likes + (likedReviews.has(review.id) ? 1 : 0)}
                      </span>
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-300 active:scale-95">
                      <MessageSquare size={16} />
                      <span className="text-sm font-medium">Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-8 text-center">
          <button className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 active:scale-95">
            Load More Reviews
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

export default ReviewsPage;
