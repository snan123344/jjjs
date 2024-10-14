// index.js
require('dotenv').config();
const express = require('express');
const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using UUID and preserve the original extension
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ storage: storage });

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  // Construct the file URL
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({ 
    message: 'File uploaded successfully.',
    fileUrl: fileUrl
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <h1>File Upload Server</h1>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="file" required /><br /><br />
      <button type="submit">Upload</button>
    </form>
  `);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
