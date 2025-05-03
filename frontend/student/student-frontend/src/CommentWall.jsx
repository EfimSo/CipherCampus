import { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm"; 

function CommentWall() {
  const [viewMode, setViewMode] = useState("comments"); // or 'write'
  const [reviews, setReviews] = useState([]);

  // Fetch reviews from backend
  useEffect(() => {
    if (viewMode === "comments") {
      fetch("http://localhost:5000/read_reviews")
        .then(res => res.json())
        .then(data => setReviews(data))
        .catch(err => console.error("Failed to fetch reviews:", err));
    }
  }, [viewMode]);

  return (
    <div className="p-4">
      <button
        onClick={() => setViewMode(viewMode === "comments" ? "write" : "comments")}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {viewMode === "comments" ? " Write Anonymous Review" : " View All Comments"}
      </button>

      {viewMode === "write" ? (
        <ReviewForm />
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-2">Anonymous Reviews</h2>
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((rev, idx) => (
                <li key={idx} className="p-4 border rounded bg-gray-100">
                  <p><strong>Class:</strong> {rev.class_name}</p>
                  <p><strong>Review:</strong> {rev.text}</p>
                  {rev.grade && <p><strong>Grade:</strong> {rev.grade}</p>}
                  {rev.major && <p><strong>Major:</strong> {rev.major}</p>}
                  {rev.rating && <p><strong>Rating:</strong> {rev.rating}</p>}
                  {typeof rev.recommend === 'boolean' && <p><strong>Recommend:</strong> {rev.recommend ? 'Yes' : 'No'}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentWall;
