// src/pages/SeekerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import UploadButton from '../components/UploadButton'; // Adjust the path as needed

const ITEMS_PER_PAGE = 5;

const SeekerDashboard = () => {
  const navigate = useNavigate();

  // Data states
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // UI/control states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // "newest" or "oldest"
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('jobs'); // "jobs", "applications", "favorites"
  const [selectedJob, setSelectedJob] = useState(null);

  // Application form states
  const [coverLetter, setCoverLetter] = useState('');
  const [personalDetails, setPersonalDetails] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  // Fetch applications for the seeker
  const fetchApplications = async () => {
    try {
      const res = await API.get('/applications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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

  // Refresh applications manually
  const refreshApplications = async () => {
    await fetchApplications();
  };

  // Toggle favorite job
  const handleFavorite = (job) => {
    if (favorites.find(fav => fav._id === job._id)) {
      setFavorites(favorites.filter(fav => fav._id !== job._id));
    } else {
      setFavorites([...favorites, job]);
    }
  };

  // Filtering and sorting of jobs
  const filteredJobs = jobs
    .filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.postedDate) - new Date(a.postedDate);
      }
      return new Date(a.postedDate) - new Date(b.postedDate);
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle application submission with resume and personal details
  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('jobId', selectedJob._id);
      formData.append('coverLetter', coverLetter);
      formData.append('personalDetails', personalDetails);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      const res = await API.post('/applications', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      setApplications([...applications, res.data]);
      // Reset form fields
      setSelectedJob(null);
      setCoverLetter('');
      setPersonalDetails('');
      setResumeFile(null);
    } catch (err) {
      console.error('Application submission failed:', err);
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

      {/* Tab Navigation */}
      <div className="mb-4">
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 mr-2 rounded ${activeTab === 'jobs' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border'}`}
        >
          Job Listings
        </button>
        <button 
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 mr-2 rounded ${activeTab === 'applications' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border'}`}
        >
          My Applications
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded ${activeTab === 'favorites' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border'}`}
        >
          Favorite Jobs
        </button>
      </div>

      {/* Job Listings Tab */}
      {activeTab === 'jobs' && (
        <>
          {/* Search & Sort Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <input 
              type="text" 
              placeholder="Search jobs..." 
              className="border p-2 w-full md:w-1/2 mb-2 md:mb-0"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border p-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Paginated Job Listings */}
          <div className="grid gap-4">
            {paginatedJobs.map((job) => (
              <div key={job._id} className="p-4 bg-white rounded shadow">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                  <button 
                    onClick={() => handleFavorite(job)}
                    className="text-yellow-500 text-2xl"
                  >
                    {favorites.find(fav => fav._id === job._id) ? '★' : '☆'}
                  </button>
                </div>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Prev
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Next
              </button>
            </div>
          )}
        </>
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
                  <p className="text-gray-600 mt-1">
                    <strong>Personal Details:</strong> {app.personalDetails || 'N/A'}
                  </p>
                  {app.resumeUrl && (
                    <p className="text-blue-500 mt-1">
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer">
                        View Resume
                      </a>
                    </p>
                  )}
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

      {/* Favorite Jobs Tab */}
      {activeTab === 'favorites' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Favorite Jobs</h2>
          {favorites.length === 0 ? (
            <p>No favorite jobs yet.</p>
          ) : (
            <div className="grid gap-4">
              {favorites.map(job => (
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
          )}
        </div>
      )}

      {/* Job Details Modal with Application Form */}
      {selectedJob && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded p-6 w-11/12 md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">{selectedJob.title}</h2>
            <p className="mb-2"><strong>Company:</strong> {selectedJob.company}</p>
            <p className="mb-2"><strong>Location:</strong> {selectedJob.location}</p>
            <p className="mb-4">{selectedJob.description}</p>
            <form onSubmit={handleApply} encType="multipart/form-data">
              <textarea 
                placeholder="Write a cover letter (optional)" 
                className="border p-2 w-full mb-2"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              ></textarea>
              <textarea 
                placeholder="Enter your personal details (phone, address, etc.)" 
                className="border p-2 w-full mb-2"
                value={personalDetails}
                onChange={(e) => setPersonalDetails(e.target.value)}
              ></textarea>
              <UploadButton onFileSelect={(file) => setResumeFile(file)} />
              <div className="flex justify-end mt-4">
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
