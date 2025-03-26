import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-4xl font-bold mb-4">Welcome to the Job Portal</h1>
    <div className="space-x-4">
      <Link to="/login" className="text-blue-500 underline">Login</Link>
      <Link to="/register" className="text-blue-500 underline">Register</Link>
    </div>
  </div>
);

export default Home;
