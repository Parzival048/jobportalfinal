import React, { useEffect, useState } from 'react';
import API from '../api';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await API.get('/jobs');
        setJobs(res.data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <div key={job._id} className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-700">{job.company} - {job.location}</p>
            <p className="text-gray-600 mt-2">{job.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
