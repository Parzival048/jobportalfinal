import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import UploadButton from '../components/UploadButton';

const ITEMS_PER_PAGE = 5;

const SeekerDashboard = () => {
  const navigate = useNavigate();

  // Data states
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI/control states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState(null);

  // Application form states
  const [coverLetter, setCoverLetter] = useState('');
  const [personalDetails, setPersonalDetails] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  // Fetch data with loading state
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [jobsRes, applicationsRes] = await Promise.all([
          API.get('/jobs'),
          API.get('/applications', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
        ]);
        setJobs(jobsRes.data);
        setApplications(applicationsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle logout with smooth transition
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { state: { from: 'logout' } });
  };

  // Toggle favorite with animation feedback
  const handleFavorite = (job) => {
    if (favorites.find(fav => fav._id === job._id)) {
      setFavorites(favorites.filter(fav => fav._id !== job._id));
    } else {
      setFavorites([...favorites, job]);
    }
  };

  // Filter and sort jobs
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

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle application submission
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
      setSelectedJob(null);
      setCoverLetter('');
      setPersonalDetails('');
      setResumeFile(null);
      
      // Show success notification
      // (You would implement a proper notification system in a real app)
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Application submission failed:', err);
      alert('Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Animated Header */}
      <header className="bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                CareerConnect Pro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <span className="text-gray-600 font-medium">Welcome Back!</span>
              </div>
              <button 
                onClick={handleLogout}
                className="group relative flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="pl-1">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transform transition-all hover:scale-[1.01] hover:shadow-lg">
          <div className="p-6 flex flex-col md:flex-row items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {localStorage.getItem('username')?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-800">{localStorage.getItem('username') || 'User'}</h2>
              <p className="text-gray-600">Job Seeker Profile</p>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Active
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {applications.length} Applications
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {favorites.length} Favorites
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              {/* <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg">
                Edit Profile
              </button> */}
            </div>
          </div>
        </div>

        {/* Tab Navigation with Glow Effect */}
        <div className="mb-8 relative">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200 rounded-full"></div>
          <nav className="flex space-x-8">
            {['jobs', 'applications', 'favorites'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-4 px-1 font-medium text-sm transition-all duration-300 ${activeTab === tab ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'jobs' && 'Job Listings'}
                {tab === 'applications' && 'My Applications'}
                {tab === 'favorites' && 'Favorite Jobs'}
                {activeTab === tab && (
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Job Listings Tab */}
        {!isLoading && activeTab === 'jobs' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:shadow-lg">
            {/* Search and Filter Bar */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search jobs by title, company or location..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg bg-white shadow-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <button className="p-2.5 rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-50">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Job Cards */}
            <div className="divide-y divide-gray-200">
              {paginatedJobs.length > 0 ? (
                paginatedJobs.map((job) => (
                  <div 
                    key={job._id} 
                    className="p-6 hover:bg-gray-50 transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                      <div className="flex-shrink-0 relative">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner">
                          <span className="text-xl font-bold text-indigo-600">{job.company.charAt(0).toUpperCase()}</span>
                        </div>
                        <button
                          onClick={() => handleFavorite(job)}
                          className={`absolute -top-2 -right-2 text-2xl p-1 rounded-full bg-white shadow-md transform transition-all duration-300 ${favorites.find(fav => fav._id === job._id) ? 'text-yellow-500 hover:text-yellow-600 scale-110' : 'text-gray-300 hover:text-yellow-400 hover:scale-110'}`}
                          aria-label={favorites.find(fav => fav._id === job._id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {favorites.find(fav => fav._id === job._id) ? '★' : '☆'}
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                            {job.title}
                          </h3>
                          <span className="mt-1 md:mt-0 text-sm font-medium text-indigo-600">
                            {job.salary ? `$${job.salary.toLocaleString()}/yr` : 'Salary not specified'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {job.company} • {job.location}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {job.type || 'Full-time'}
                          </span>
                          {job.skills?.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {skill}
                            </span>
                          ))}
                          {job.skills?.length > 3 && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 self-center">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search or filter to find what you\'re looking for.' : 'There are currently no job listings available.'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)}</span> of{' '}
                      <span className="font-medium">{filteredJobs.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Applications Tab */}
        {!isLoading && activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:shadow-lg">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
              <button
                onClick={() => fetchApplications()}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
              >
                <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            {applications.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No applications yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Apply for jobs to see them listed here.
                </p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {applications.map(app => (
                  <div key={app._id} className="p-6 hover:bg-gray-50 transition-colors duration-300">
                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                      <div className="flex-shrink-0 relative">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner">
                          <span className="text-xl font-bold text-indigo-600">{app.job.company.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(app.status)} shadow-md`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">{app.job.title}</h3>
                          <span className="text-sm text-gray-500">
                            Applied on: {new Date(app.appliedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {app.job.company} • {app.job.location}
                        </p>
                        <div className="mt-3 space-y-2">
                          {app.coverLetter && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cover Letter</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{app.coverLetter}</p>
                            </div>
                          )}
                          {app.personalDetails && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal Details</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{app.personalDetails}</p>
                            </div>
                          )}
                          {app.resumeUrl && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resume</h4>
                              <a 
                                href={app.resumeUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                Download Resume
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorite Jobs Tab */}
        {!isLoading && activeTab === 'favorites' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:shadow-lg">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <h2 className="text-lg font-semibold text-gray-900">Favorite Jobs</h2>
            </div>
            {favorites.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No favorite jobs yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Click the star icon on job listings to add them to your favorites.
                </p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {favorites.map(job => (
                  <div 
                    key={job._id} 
                    className="p-6 hover:bg-gray-50 transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                      <div className="flex-shrink-0 relative">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner">
                          <span className="text-xl font-bold text-indigo-600">{job.company.charAt(0).toUpperCase()}</span>
                        </div>
                        <button
                          onClick={() => handleFavorite(job)}
                          className="absolute -top-2 -right-2 text-2xl p-1 rounded-full bg-white shadow-md text-yellow-500 hover:text-yellow-600 transition-all duration-300 transform hover:scale-110"
                        >
                          ★
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {job.company} • {job.location}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 self-center">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div 
                className="absolute inset-0 bg-gray-500 opacity-75" 
                onClick={() => setSelectedJob(null)}
              ></div>
            </div>
            
            {/* Modal container */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Apply for: {selectedJob.title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {selectedJob.company} • {selectedJob.location}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Application form */}
                <form onSubmit={handleApply} encType="multipart/form-data" className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      id="coverLetter"
                      rows={4}
                      className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Explain why you're a good fit for this position..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="personalDetails" className="block text-sm font-medium text-gray-700">
                      Personal Details
                    </label>
                    <textarea
                      id="personalDetails"
                      rows={3}
                      className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Your contact information, availability, etc."
                      value={personalDetails}
                      onChange={(e) => setPersonalDetails(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Resume Upload
                    </label>
                    <UploadButton onFileSelect={(file) => setResumeFile(file)} />
                    <p className="mt-1 text-xs text-gray-500">
                      Upload your resume in PDF or DOCX format (max 5MB)
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setSelectedJob(null)}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Submit Application
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for status badge styling
function getStatusBadgeStyle(status) {
  switch (status.toLowerCase()) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'reviewed':
      return 'bg-purple-100 text-purple-800';
    case 'interview':
      return 'bg-yellow-100 text-yellow-800';
    case 'hired':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default SeekerDashboard;