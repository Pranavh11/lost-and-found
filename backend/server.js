const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/claims', require('./routes/claims'));

// Serve static assets in production (if needed)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Lost & Found Management System API' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`🌐 API Base: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
