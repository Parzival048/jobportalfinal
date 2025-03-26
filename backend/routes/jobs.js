// routes/jobs.js
const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  createJob,
  getJobsByEmployee,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Anyone can view jobs
router.get('/', getAllJobs);

// Only employees can post jobs
router.post('/', authMiddleware, roleMiddleware(['employee']), createJob);

// Get jobs posted by the current employee
router.get('/myjobs', authMiddleware, roleMiddleware(['employee']), getJobsByEmployee);

// Update a job posting
router.put('/:id', authMiddleware, roleMiddleware(['employee']), updateJob);

// Delete a job posting
router.delete('/:id', authMiddleware, roleMiddleware(['employee']), deleteJob);

module.exports = router;
