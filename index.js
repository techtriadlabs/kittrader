const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./routes/authRoute');
const dataRoute = require('./routes/dataRoute');
const fileRoute = require('./routes/fileRoute');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/data', dataRoute);
app.use('/api/files', fileRoute);

// MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB!'))
  .catch((error) => console.error('Failed to connect', error));

// Error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});
