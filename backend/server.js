import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route modules
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import itineraryRoutes from './routes/itineraryRoutes.js';
import stopRoutes from './routes/stopRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/stops', stopRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Travel app API is running.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

export default app;
