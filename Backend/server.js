const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const customerRoutes = require('./routes/customerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cardRoutes = require('./routes/cardRoutes');

const staffRoutes = require('./routes/staffRoutes');

// Backend Server

dotenv.config();
const app = express();

// Middleware
app.set('trust proxy', 1);

// Helmet for HTTP headers
app.use(helmet());

// Content Security Policy for XSS attacks
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none';");
  next();
});

// HTTP Strict Transport Security to force HTTPS
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Clickjacking protection
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// CORS setup for development 
const corsOptions = {
  origin: 'https://localhost:3000', // Allow requests from frontend
  optionsSuccessStatus: 200 // For legacy browsers 
};
app.use(cors(corsOptions));


// Rate limiting to prevent DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cards', cardRoutes);

app.use('/api/staff', staffRoutes);

// MongoDB Connection
mongoose.connect(process.env.ATLAS_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// SSL Options for HTTPS
const sslOptions = {
  key: fs.readFileSync('keys/privatekey.pem'),
  cert: fs.readFileSync('keys/certificate.pem')
};

// Start server with HTTPS
const PORT = process.env.PORT || 5000;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});
