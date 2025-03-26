// src/pages/EmployeeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const ITEMS_PER_PAGE = 5;

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  // Data states
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  // UI states for job postings
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [jobSortOrder, setJobSortOrder] = useState('newest'); // newest or oldest
  const [currentPage, setCurrentPage] = useState(1);
  const [editingJob, setEditingJob] = useState(null);
  const [editJobData, setEditJobData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
  });

  // Tab navigation state: "jobs" or "applications"
  const [activeTab, setActiveTab] = useState('jobs');

  // Application filter state (optional)
  const [appSearchTerm, setAppSearchTerm] = useState('');

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch job postings posted by the current employee
  const fetchEmployeeJobs = async () => {
    try {
      const res = await API.get('/jobs/myjobs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  // Fetch applications for the employee's jobs
  const fetchEmployeeApplications = async () => {
    try {
      const res = await API.get('/applications/employee', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  useEffect(() => {
    fetchEmployeeJobs();
    fetchEmployeeApplications();
  }, []);

  // Refresh applications manually
  const refreshApplications = async () => {
    await fetchEmployeeApplications();
  };

  // Handle creating a new job posting
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/jobs', newJob, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setJobs([res.data, ...jobs]);
      setNewJob({ title: '', description: '', company: '', location: '' });
    } catch (err) {
      console.error('Failed to create job:', err);
    }
  };

  // Handle editing a job posting: open modal and set current values
  const handleEditClick = (job) => {
    setEditingJob(job._id);
    setEditJobData({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
    });
  };

  // Handle job update submission
  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/jobs/${editingJob}`, editJobData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setJobs(jobs.map((job) => (job._id === editingJob ? res.data : job)));
      setEditingJob(null);
    } catch (err) {
      console.error('Failed to update job:', err);
    }
  };

  // Handle job deletion
  const handleDeleteJob = async (jobId) => {
    try {
      await API.delete(`/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setJobs(jobs.filter((job) => job._id !== jobId));
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  // Filtering & sorting for job postings
  const filteredJobs = jobs
    .filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (jobSortOrder === 'newest') {
        return new Date(b.postedDate) - new Date(a.postedDate);
      }
      return new Date(a.postedDate) - new Date(b.postedDate);
    });

  // Pagination for job postings
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Filtering applications (optional)
  const filteredApps = applications.filter(app =>
    app.job.title.toLowerCase().includes(appSearchTerm.toLowerCase())
  );

  // Update application status (accept/reject)
  const handleUpdateApplicationStatus = async (appId, status) => {
    try {
      const res = await API.put(`/applications/${appId}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setApplications(applications.map(app => app._id === appId ? res.data : app));
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TalentConnect Pro</h1>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">Welcome, Employer</span>
            <button 
              onClick={handleLogout}
              className="bg-white text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Employer Dashboard</h2>
          <p className="text-gray-600">Manage your job postings and review applications</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'jobs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              My Job Postings
              <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {jobs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'applications' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Review Applications
              <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {applications.length}
              </span>
            </button>
          </nav>
        </div>

        {/* My Job Postings Tab */}
        {activeTab === 'jobs' && (
          <>
            {/* Create Job Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Job Posting</h3>
              <form onSubmit={handleCreateJob}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title*</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company*</label>
                    <input
                      type="text"
                      placeholder="Your company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. New York, NY or Remote"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea
                    placeholder="Describe the position, requirements, and benefits..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Post Job
                  </button>
                </div>
              </form>
            </div>

            {/* Job Listings Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search job postings..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="flex items-center">
                  <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    id="sort"
                    value={jobSortOrder}
                    onChange={(e) => setJobSortOrder(e.target.value)}
                    className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Job Listings */}
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No job postings found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search or filter' : 'Get started by creating a new job posting'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedJobs.map((job) => (
                      <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-indigo-600">{job.title}</h3>
                            <p className="text-gray-700">{job.company} • {job.location || 'Location not specified'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(job)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-gray-600">{job.description}</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Posted on {new Date(job.postedDate).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => {
                              setActiveTab('applications');
                              setAppSearchTerm(job.title);
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            View applications →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)}</span> of{' '}
                        <span className="font-medium">{filteredJobs.length}</span> jobs
                      </div>
                      <nav className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Edit Job Modal */}
            {editingJob && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Job Posting</h3>
                      <form onSubmit={handleUpdateJob}>
                        <div className="grid grid-cols-1 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title*</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={editJobData.title}
                              onChange={(e) => setEditJobData({ ...editJobData, title: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company*</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={editJobData.company}
                              onChange={(e) => setEditJobData({ ...editJobData, company: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={editJobData.location}
                              onChange={(e) => setEditJobData({ ...editJobData, location: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                            <textarea
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={editJobData.description}
                              onChange={(e) => setEditJobData({ ...editJobData, description: e.target.value })}
                            ></textarea>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingJob(null)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Review Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Job Applications</h3>
              <div className="flex items-center space-x-4">
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by job title..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={appSearchTerm}
                    onChange={(e) => setAppSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={refreshApplications}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No applications found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {appSearchTerm ? 'Try adjusting your search' : 'Applications will appear here when candidates apply to your jobs'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApps.map(app => (
                  <div key={app._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{app.job.title}</h3>
                        <p className="text-gray-600">{app.seeker.username} • {app.seeker.email}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      {app.coverLetter && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Cover Letter</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-line">{app.coverLetter}</p>
                        </div>
                      )}
                      {app.personalDetails && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Personal Details</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-line">{app.personalDetails}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        {app.resumeUrl && (
                          <a 
                            href={app.resumeUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            View Resume
                          </a>
                        )}
                        <span className="text-sm text-gray-500">
                          Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {app.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateApplicationStatus(app._id, 'accepted')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app._id, 'rejected')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUpdateApplicationStatus(app._id, 'pending')}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Reset to Pending
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;