const Application = require('../models/Application');
const Job = require('../models/Job');

exports.applyToJob = async (req, res) => {
    try {
      const { jobId, coverLetter, personalDetails } = req.body;
      
      // Check if the job exists
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: 'Job not found' });
  
      // If a resume file was uploaded, its path is available as req.file.path
      const resumeUrl = req.file ? req.file.path : '';
  
      const newApplication = new Application({
        job: jobId,
        seeker: req.user,
        coverLetter,
        personalDetails,
        resumeUrl,
      });
      await newApplication.save();
      res.status(201).json(newApplication);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

exports.getApplicationsForSeeker = async (req, res) => {
  try {
    const applications = await Application.find({ seeker: req.user }).populate('job');
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// New: Get applications for jobs posted by the current employee
exports.getApplicationsForEmployee = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user }).select('_id');
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job')
      .populate('seeker');
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// New: Update the status of an application (accept or reject)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params; // Application id
    const { status } = req.body; // Expected values: "accepted" or "rejected"

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    // Ensure the current employee is the poster of the job
    if (application.job.postedBy.toString() !== req.user) {
      return res.status(403).json({ message: 'Access denied' });
    }
    application.status = status;
    await application.save();
    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
