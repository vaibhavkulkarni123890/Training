const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const User = require('../models/User');
const Project = require('../models/Project');
const { analyzeReport } = require('../services/analysisService');
const { generateCertificate } = require('../services/documentService');
const { sendCertificateEmail } = require('../services/emailService');
const multer = require('multer');
const path = require('path');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, 'report-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Submit Report (only after project selection)
router.post('/submit', auth, upload.single('reportFile'), async (req, res) => {
    const { textContent, weekNumber } = req.body;

    if (!textContent) {
        return res.status(400).json({ error: 'textContent is required' });
    }

    try {
        // Verify user has a selected project
        const user = await User.findById(req.user.id);
        if (!user.selectedProject || !user.projectLockedAt) {
            return res.status(403).json({ error: 'You must select a project before submitting reports' });
        }

        // Get ALL reports for global similarity analysis (limit to last 500 for performance)
        const allReports = await Report.find({}).sort({ createdAt: -1 }).limit(500).select('textContent user');

        // Also get the current project roadmap to check against (don't copy description)
        const project = await Project.findById(user.selectedProject);
        const roadmapTexts = project.roadmap ? project.roadmap.map(r => r.description) : [];

        const analysis = analyzeReport(textContent, allReports, roadmapTexts, req.user.id);

        const previousReportsCount = allReports.filter(r => r.user.toString() === req.user.id.toString()).length;

        const newReport = new Report({
            user: req.user.id,
            weekNumber: weekNumber || previousReportsCount + 1,
            textContent,
            fileUrl: req.file ? req.file.path : null,
            analysis: {
                ...analysis,
                status: 'analyzed'
            }
        });

        await newReport.save();

        // Update user's submission list
        const updatedUser = await User.findByIdAndUpdate(req.user.id, {
            $push: { weeklySubmissions: newReport._id }
        }, { new: true }).populate('selectedProject');

        let courseCompletedNow = false;

        // Check if course is complete
        if (updatedUser.selectedProject && !updatedUser.courseCompleted) {
            const requiredSubmissions = updatedUser.selectedProject.estimatedWeeks;
            if (updatedUser.weeklySubmissions.length >= requiredSubmissions) {
                updatedUser.courseCompleted = true;
                courseCompletedNow = true;

                try {
                    const certPath = await generateCertificate(updatedUser, updatedUser.selectedProject);
                    updatedUser.certificateUrl = certPath;
                    
                    sendCertificateEmail(updatedUser, updatedUser.selectedProject).catch(e => {
                        console.error('Certificate email error:', e.message);
                    });
                } catch (docErr) {
                    console.error('Certificate generation error:', docErr.message);
                }

                await updatedUser.save();
            }
        }

        res.json({
            report: newReport,
            courseCompleted: courseCompletedNow,
            certificateUrl: updatedUser.certificateUrl
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get User's Reports
router.get('/my-reports', auth, async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user.id }).sort({ weekNumber: 1 });
        res.json(reports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get deadline info
router.get('/deadline', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.projectLockedAt) {
            return res.json({ hasDeadline: false });
        }

        // Deadline is every Sunday from project lock date
        const lockDate = new Date(user.projectLockedAt);
        const now = new Date();
        const daysSinceLock = Math.floor((now - lockDate) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(daysSinceLock / 7) + 1;

        // Next Sunday
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        const nextDeadline = new Date(now);
        nextDeadline.setDate(now.getDate() + daysUntilSunday);
        nextDeadline.setHours(23, 59, 59, 999);

        const reports = await Report.find({ user: req.user.id });

        res.json({
            hasDeadline: true,
            currentWeek,
            nextDeadline: nextDeadline.toISOString(),
            daysRemaining: daysUntilSunday,
            totalSubmissions: reports.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to get deadline' });
    }
});

module.exports = router;
