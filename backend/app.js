const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes   = require('./routes/authRoutes');
const enrollRoutes = require('./routes/enrollRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// ── Middleware ──
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// ── Routes ──
app.use('/api/auth',    authRoutes);
app.use('/api/enroll',  enrollRoutes);
app.use('/api/reviews', reviewRoutes);

// ── Health check ──
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── 404 fallback ──
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

module.exports = app;
