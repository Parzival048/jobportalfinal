// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  company:     { type: String, required: true },
  location:    { type: String },
  postedDate:  { type: Date, default: Date.now },
  // Optionally, you can add a reference to the employee who posted the job
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
