const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const app = express();

// ─── Trust Proxy for Render/Production ─────────────────────────
app.set('trust proxy', 1); // Trust first proxy (required for Render)

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

app.use('/documents', express.static(path.join(__dirname, 'documents')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle document download with better error handling
app.get('/documents/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'documents', filename);
    
    // Check if file exists
    if (!require('fs').existsSync(filepath)) {
        console.error(`❌ Document not found: ${filename}`);
        return res.status(404).json({ 
            error: 'Document not found',
            message: 'The requested document may have been moved or deleted. Please contact support.'
        });
    }
    
    // Serve the file
    res.sendFile(filepath, (err) => {
        if (err) {
            console.error(`❌ Error serving document ${filename}:`, err.message);
            res.status(500).json({ error: 'Failed to serve document' });
        } else {
            console.log(`✅ Document served: ${filename}`);
        }
    });
});

// ─── Routes ────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/submissions', require('./routes/projects'));  // plagiarism submissions
app.use('/api/notifications', require('./routes/notifications')); // notification system
app.use('/api/push', require('./routes/pushNotifications')); // push notifications

// ─── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const { startEmailReminders } = require('./services/emailService');

const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables!');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB Connected');
        
        // Regenerate missing documents on startup
        try {
            const User = require('./models/User');
            const Project = require('./models/Project');
            const { generateOfferLetter, generateCertificate } = require('./services/documentService');
            
            console.log('🔄 Checking for users with missing documents...');
            
            const usersWithProjects = await User.find({
                selectedProject: { $ne: null },
                paymentStatus: 'paid',
                $or: [
                    { offerLetterUrl: { $exists: true, $ne: '' } },
                    { certificateUrl: { $exists: true, $ne: '' } }
                ]
            }).populate('selectedProject');
            
            let regeneratedCount = 0;
            
            for (const user of usersWithProjects) {
                const project = user.selectedProject;
                let updated = false;
                
                // Check if offer letter file exists
                if (user.offerLetterUrl) {
                    const offerPath = require('path').join(__dirname, 'documents', user.offerLetterUrl.replace('/documents/', ''));
                    if (!require('fs').existsSync(offerPath)) {
                        console.log(`📄 Regenerating offer letter for ${user.email}`);
                        const newOfferPath = await generateOfferLetter(user, project);
                        user.offerLetterUrl = newOfferPath;
                        updated = true;
                        regeneratedCount++;
                    }
                }
                
                // Check if certificate file exists
                if (user.certificateUrl && user.courseCompleted) {
                    const certPath = require('path').join(__dirname, 'documents', user.certificateUrl.replace('/documents/', ''));
                    if (!require('fs').existsSync(certPath)) {
                        console.log(`🏆 Regenerating certificate for ${user.email}`);
                        const newCertPath = await generateCertificate(user, project);
                        user.certificateUrl = newCertPath;
                        updated = true;
                        regeneratedCount++;
                    }
                }
                
                if (updated) {
                    await user.save();
                }
            }
            
            if (regeneratedCount > 0) {
                console.log(`✅ Regenerated ${regeneratedCount} documents on startup`);
            } else {
                console.log('✅ All documents are present');
            }
            
        } catch (docError) {
            console.error('⚠️ Document regeneration error:', docError.message);
            // Don't block server startup if document regeneration fails
        }
        
        startEmailReminders();
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        // On Render, we want to keep the process alive long enough to see the logs
        // But if we can't connect, we can't really function.
        process.exit(1);
    });
