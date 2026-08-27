const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// CORS configuration supporting local Vite dev and cloud deployments
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps or curl) or matching origins/vercel previews
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'University Study Space Finder API is running smoothly',
    timestamp: new Date(),
  });
});

// API Routes
const apiRouter = express.Router();
apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/spaces', require('./routes/spaceRoutes'));
apiRouter.use('/seats', require('./routes/seatRoutes'));
apiRouter.use('/reservations', require('./routes/reservationRoutes'));
apiRouter.use('/favorites', require('./routes/favoriteRoutes'));
apiRouter.use('/analytics', require('./routes/analyticsRoutes'));
apiRouter.use('/predictions', require('./routes/predictionRoutes'));
apiRouter.use('/ai', require('./routes/aiRoutes'));
apiRouter.use('/admin', require('./routes/adminRoutes'));

app.use('/api', apiRouter);
app.use('/', apiRouter);

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Server] Study Space Finder Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
