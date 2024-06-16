const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Set up multer
const upload = multer({ storage });

// Define the upload route
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send({
    message: 'File uploaded successfully!',
    filePath: `/uploads/${req.file.filename}`,
  });
});

module.exports = router;
