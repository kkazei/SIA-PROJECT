import React, { useState } from 'react';

const RatingForm = ({ onSubmit, disabled = false, initialRating = null }) => {
  const [rating, setRating] = useState(initialRating?.score || 0);
  const [comment, setComment] = useState(initialRating?.comment || '');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, comment);
  };

  // If a rating exists, show it in read-only mode
  if (initialRating) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Your Rating</h4>
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-5 h-5 ${star <= initialRating.score ? 'text-yellow-400' : 'text-gray-300'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-2 text-gray-700">{initialRating.score}/5</span>
        </div>
        {initialRating.comment && (
          <p className="text-gray-600 italic">"{initialRating.comment}"</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Submitted on {new Date(initialRating.createdAt).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rate your experience</label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="focus:outline-none"
            >
              <svg
                className={`w-8 h-8 ${
                  star <= (hoveredStar || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-gray-700 self-center">{rating > 0 ? `${rating}/5` : ""}</span>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your comments (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Share your experience..."
          rows="3"
          disabled={disabled}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || rating === 0}
        className={`w-full bg-blue-600 text-white py-2 px-4 rounded ${
          disabled || rating === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        {disabled ? 'Submitting...' : 'Submit Rating'}
      </button>
    </form>
  );
};

export default RatingForm;