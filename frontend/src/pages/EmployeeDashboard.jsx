import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  // State for job posting management
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
  });
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [editJobData, setEditJobData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
  });
  // State for tab navigation ("jobs" or "applications")
  const [activeTab, setActiveTab] = useState("jobs");
  // State for applications (for review)
  const [applications, setApplications] = useState([]);

  // Logout function: clears token and navigates to login page
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch jobs posted by the employee
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

  // Create a new job posting
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

  // Open edit modal and load job data
  const handleEditClick = (job) => {
    setEditingJob(job._id);
    setEditJobData({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
    });
  };

  // Update a job posting
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

  // Delete a job posting
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

  // Update application status (accept or reject)
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
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
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
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 mr-2 rounded ${activeTab === "jobs" ? "bg-blue-500 text-white" : "bg-white text-blue-500 border"}`}
        >
          My Job Postings
        </button>
        <button 
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2 rounded ${activeTab === "applications" ? "bg-blue-500 text-white" : "bg-white text-blue-500 border"}`}
        >
          Review Applications
        </button>
      </div>

      {activeTab === "jobs" && (
        <>
          {/* Job Posting Form */}
          <div className="mb-8 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Post a New Job</h2>
            <form onSubmit={handleCreateJob}>
              <input
                type="text"
                placeholder="Job Title"
                className="border p-2 w-full mb-2"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Company"
                className="border p-2 w-full mb-2"
                value={newJob.company}
                onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Location"
                className="border p-2 w-full mb-2"
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
              />
              <textarea
                placeholder="Job Description"
                className="border p-2 w-full mb-2"
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              ></textarea>
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                Create Job
              </button>
            </form>
          </div>

          {/* Job Postings List */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">My Job Postings</h2>
            {jobs.length === 0 ? (
              <p>No job postings found.</p>
            ) : (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <div key={job._id} className="p-4 bg-white rounded shadow">
                    <h3 className="text-xl font-bold">{job.title}</h3>
                    <p className="text-gray-700">{job.company} - {job.location}</p>
                    <p className="text-gray-600 mt-2">{job.description}</p>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleEditClick(job)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "applications" && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Applications for Your Jobs</h2>
          {applications.length === 0 ? (
            <p>No applications found.</p>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => (
                <div key={app._id} className="p-4 bg-white rounded shadow">
                  <h3 className="text-xl font-bold">{app.job.title}</h3>
                  <p className="text-gray-700">
                    Applicant: {app.seeker.username} ({app.seeker.email})
                  </p>
                  <p className="text-gray-600 mt-2">
                    <strong>Cover Letter:</strong> {app.coverLetter || 'N/A'}
                  </p>
                  <p className="text-gray-500 mt-1">
                    Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 mt-1">
                    Status: {app.status}
                  </p>
                  {app.status === "pending" && (
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => handleUpdateApplicationStatus(app._id, "accepted")}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateApplicationStatus(app._id, "rejected")}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded p-6 w-11/12 md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Edit Job</h2>
            <form onSubmit={handleUpdateJob}>
              <input
                type="text"
                placeholder="Job Title"
                className="border p-2 w-full mb-2"
                value={editJobData.title}
                onChange={(e) =>
                  setEditJobData({ ...editJobData, title: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Company"
                className="border p-2 w-full mb-2"
                value={editJobData.company}
                onChange={(e) =>
                  setEditJobData({ ...editJobData, company: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Location"
                className="border p-2 w-full mb-2"
                value={editJobData.location}
                onChange={(e) =>
                  setEditJobData({ ...editJobData, location: e.target.value })
                }
              />
              <textarea
                placeholder="Job Description"
                className="border p-2 w-full mb-2"
                value={editJobData.description}
                onChange={(e) =>
                  setEditJobData({ ...editJobData, description: e.target.value })
                }
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="mr-2 bg-gray-300 text-black px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
