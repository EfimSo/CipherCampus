import React from "react";
import CommentWall from "./CommentWall";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Course Review Portal</h1>
      <CommentWall />
    </div>
  );
}

export default App;
