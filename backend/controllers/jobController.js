// controllers/jobController.js
const Job = require('../models/Job');

// Existing functions:
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedDate: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createJob = async (req, res) => {
  try {
    const { title, description, company, location } = req.body;
    // Save job with postedBy as current user (from auth middleware)
    const newJob = new Job({ title, description, company, location, postedBy: req.user });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get jobs posted by the current employee
exports.getJobsByEmployee = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user }).sort({ postedDate: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a job posting (only if posted by the logged-in employee)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check that the job was created by the current employee
    if (job.postedBy.toString() !== req.user) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a job posting (only if posted by the logged-in employee)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Job.findByIdAndDelete(id);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
