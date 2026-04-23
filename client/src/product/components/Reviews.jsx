import React from "react";

const StarRating = ({ rating, size = "w-4 h-4" }) => (
  <div className="flex items-center space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`${size} ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function Reviews({ data }) {
  const averageRating = data.length > 0 
    ? (data.reduce((sum, review) => sum + review.rating, 0) / data.length).toFixed(1)
    : 0;
  const totalReviews = data.length;

  return (
    <div className="w-full p-4">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-yellow-500 text-white p-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Customer Reviews</h2>
              <p className="text-yellow-100 text-sm">What customers say</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-yellow-50/30">
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-5 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <StarRating rating={Math.floor(averageRating)} size="w-6 h-6" />
                <div className="text-center md:text-left">
                  <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
                  <div className="text-sm text-gray-600">out of 5 stars</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{totalReviews}</div>
                <div className="text-sm text-gray-600">{totalReviews === 1 ? 'review' : 'reviews'}</div>
              </div>
            </div>
          </div>

          {data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.map((review) => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {review.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{review.name}</h4>
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-500 block mt-1">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">"{review.review}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">⭐</div>
              <div className="text-gray-400 text-base mb-2">No reviews yet</div>
              <p className="text-gray-500 text-sm">Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
