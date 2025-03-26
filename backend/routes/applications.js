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
const upload = require('../middleware/upload');

// For job seekers: use upload.single('resume') to process file uploads
router.post('/', authMiddleware, upload.single('resume'), applyToJob);
router.get('/', authMiddleware, getApplicationsForSeeker);

// For employees:
router.get('/employee', authMiddleware, roleMiddleware(['employee']), getApplicationsForEmployee);
router.put('/:id/status', authMiddleware, roleMiddleware(['employee']), updateApplicationStatus);

module.exports = router;
