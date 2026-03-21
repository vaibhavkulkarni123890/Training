const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

console.log('--- STARTING SERVER ---');
dotenv.config();
console.log('Env variables loaded');

const app = express();
console.log('Express app initialized');

// ─── Security Middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
console.log('Body parsing middleware applied.');

// ─── Static Files (documents & uploads) ────────────────────────
console.log('Setting up static file serving...');
app.use('/documents', express.static(path.join(__dirname, 'documents')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Static file serving configured.');

// ─── Routes ────────────────────────────────────────────────────
console.log('Loading routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/submissions', require('./routes/projects'));  // plagiarism submissions
console.log('Routes loaded');

// ─── Health Check ──────────────────────────────────────────────
console.log('Setting up health check endpoint...');
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
console.log('Health check endpoint configured.');

const { startEmailReminders } = require('./services/emailService');

const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables!');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        startEmailReminders();
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        // On Render, we want to keep the process alive long enough to see the logs
        // But if we can't connect, we can't really function.
        process.exit(1);
    });
