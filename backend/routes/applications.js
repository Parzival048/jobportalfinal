const express = require('express');
const router = express.Router();
const { 
  applyToJob, 
  getApplicationsForSeeker, 
  getApplicationsForEmployee, 
  updateApplicationStatus 
} = require('../controllers/applicationController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Routes for job seekers
router.post('/', authMiddleware, applyToJob);
router.get('/', authMiddleware, getApplicationsForSeeker);

// Routes for employees
router.get('/employee', authMiddleware, roleMiddleware(['employee']), getApplicationsForEmployee);
router.put('/:id/status', authMiddleware, roleMiddleware(['employee']), updateApplicationStatus);

module.exports = router;
