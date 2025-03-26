const multer = require('multer');
const path = require('path');

// Ensure you have an 'uploads' folder in your project root

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Unique filename: timestamp-originalname
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only PDF, DOC, DOCX files
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  }
  cb(new Error('Only PDF, DOC, or DOCX files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
