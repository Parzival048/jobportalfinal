import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const SeekerDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'applications'

  // Logout function: clears token and navigates to login page
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch jobs from the backend
  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  // Fetch the seeker's applications
  const fetchApplications = async () => {
    try {
      const res = await API.get('/applications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  // Refresh applications
  const refreshApplications = async () => {
    await fetchApplications();
  };

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle job application submission
  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/applications', {
        jobId: selectedJob._id,
        coverLetter
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setApplications([...applications, res.data]);
      setSelectedJob(null);
      setCoverLetter('');
    } catch (err) {
      console.error('Application failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seeker Dashboard</h1>
        <button 
          onClick={handleLogout} 
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <button 
          onClick={() => setActiveTab('jobs')} 
          className={`px-4 py-2 mr-2 ${activeTab === 'jobs' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'} rounded`}
        >
          Job Listings
        </button>
        <button 
          onClick={() => setActiveTab('applications')} 
          className={`px-4 py-2 ${activeTab === 'applications' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'} rounded`}
        >
          My Applications
        </button>
      </div>

      {/* Job Listings Tab */}
      {activeTab === 'jobs' && (
        <div>
          <input 
            type="text" 
            placeholder="Search jobs..." 
            className="border p-2 w-full mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <div key={job._id} className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <p className="text-gray-700">{job.company} - {job.location}</p>
                <p className="text-gray-600 mt-2">{job.description}</p>
                <button 
                  onClick={() => setSelectedJob(job)}
                  className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
                >
                  View Details & Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Applications Tab */}
      {activeTab === 'applications' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">My Applications</h2>
            <button
              onClick={refreshApplications}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Refresh
            </button>
          </div>
          {applications.length === 0 ? (
            <p>You haven't applied for any jobs yet.</p>
          ) : (
            <div className="grid gap-4">
              {applications.map(app => (
                <div key={app._id} className="p-4 bg-white rounded shadow">
                  <h2 className="text-xl font-semibold">{app.job.title}</h2>
                  <p className="text-gray-700">{app.job.company} - {app.job.location}</p>
                  <p className="text-gray-600 mt-2">
                    <strong>Cover Letter:</strong> {app.coverLetter || 'N/A'}
                  </p>
                  <p className="text-gray-500 mt-1">
                    Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 mt-1">
                    Status: {app.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded p-6 w-11/12 md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">{selectedJob.title}</h2>
            <p className="mb-2"><strong>Company:</strong> {selectedJob.company}</p>
            <p className="mb-2"><strong>Location:</strong> {selectedJob.location}</p>
            <p className="mb-4">{selectedJob.description}</p>
            <form onSubmit={handleApply}>
              <textarea 
                placeholder="Write a cover letter (optional)" 
                className="border p-2 w-full mb-4"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              ></textarea>
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setSelectedJob(null)}
                  className="mr-2 bg-gray-300 text-black px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;
