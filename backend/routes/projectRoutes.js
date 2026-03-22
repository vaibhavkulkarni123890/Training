const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');
const { sendProjectSelectionEmail } = require('../services/emailService');
const { generateOfferLetter } = require('../services/documentService');

// GET / — List all projects (filterable)
router.get('/', async (req, res) => {
    const { category, difficulty, planRequired } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (planRequired) filter.planRequired = planRequired;

    try {
        const projects = await Project.find(filter).sort({ category: 1, difficulty: 1 });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET /my-project — Get user's selected project with current phase info
router.get('/my-project', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('selectedProject');
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        if (!user.selectedProject) {
            return res.status(404).json({ error: 'No project selected' });
        }

        const project = user.selectedProject;
        const currentWeek = user.currentWeek || 1;
        
        // Prepare roadmap with current phase highlighted
        const roadmapWithStatus = project.roadmap.map((phase, index) => {
            const phaseNumber = index + 1;
            let status = 'locked';
            
            if (phaseNumber < currentWeek) {
                status = 'completed';
            } else if (phaseNumber === currentWeek) {
                status = 'current';
            }
            
            return {
                ...phase.toObject(),
                phaseNumber,
                status,
                // Only show detailed description for current phase
                description: phaseNumber === currentWeek ? phase.description : ''
            };
        });

        res.json({
            project: {
                ...project.toObject(),
                roadmap: roadmapWithStatus
            },
            currentWeek,
            totalWeeks: project.estimatedWeeks,
            progress: Math.round((currentWeek / project.estimatedWeeks) * 100)
        });
    } catch (err) {
        console.error('Get my project error:', err.message);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// GET /:id — Get project details
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// POST /select — Lock project to user (cannot change once selected)
router.post('/select', auth, async (req, res) => {
    const { projectId } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: 'projectId is required' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check if user has paid
        if (user.paymentStatus !== 'paid') {
            return res.status(403).json({ error: 'Payment required before selecting a project' });
        }

        // Check if user already has a locked project
        if (user.selectedProject) {
            return res.status(400).json({ error: 'You have already selected a project. Project selection cannot be changed.' });
        }

        // Verify project exists
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        // Check plan compatibility
        if (project.planRequired === 'Advanced' && user.planType !== 'Advanced') {
            return res.status(403).json({ error: 'This project requires the Advanced plan' });
        }

        // Lock project to user
        user.selectedProject = project._id;
        user.projectLockedAt = new Date();

        // Generate offer letter
        try {
            const offerLetterPath = await generateOfferLetter(user, project);
            user.offerLetterUrl = offerLetterPath;
        } catch (docErr) {
            console.error('Offer letter generation error:', docErr.message);
            // Don't block project selection if document generation fails
        }

        await user.save();

        // Send email notification (non-blocking)
        sendProjectSelectionEmail(user, project).catch(err => {
            console.error('Email send error:', err.message);
        });

        res.json({
            success: true,
            message: 'Project selected and locked successfully',
            project: project,
            offerLetterUrl: user.offerLetterUrl
        });
    } catch (err) {
        console.error('Project selection error:', err.message);
        res.status(500).json({ error: 'Failed to select project' });
    }
});

// POST /advance-week — Advance to next week/phase (for testing or admin)
router.post('/advance-week', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('selectedProject');
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        if (!user.selectedProject) {
            return res.status(400).json({ error: 'No project selected' });
        }

        const currentWeek = user.currentWeek || 1;
        const totalWeeks = user.selectedProject.estimatedWeeks;
        
        if (currentWeek >= totalWeeks) {
            return res.status(400).json({ error: 'Project already completed' });
        }

        user.currentWeek = currentWeek + 1;
        
        // Mark course as completed if reached final week
        if (user.currentWeek >= totalWeeks) {
            user.courseCompleted = true;
        }
        
        await user.save();

        res.json({
            success: true,
            message: `Advanced to week ${user.currentWeek}`,
            currentWeek: user.currentWeek,
            courseCompleted: user.courseCompleted
        });
    } catch (err) {
        console.error('Advance week error:', err.message);
        res.status(500).json({ error: 'Failed to advance week' });
    }
});

// POST /regenerate-documents — Regenerate missing offer letter/certificate
router.post('/regenerate-documents', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('selectedProject');
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        if (!user.selectedProject) {
            return res.status(400).json({ error: 'No project selected' });
        }

        const project = user.selectedProject;
        const results = {};

        // Regenerate offer letter if user has selected a project
        if (user.selectedProject && user.paymentStatus === 'paid') {
            try {
                const offerLetterPath = await generateOfferLetter(user, project);
                user.offerLetterUrl = offerLetterPath;
                results.offerLetter = offerLetterPath;
                console.log(`✅ Regenerated offer letter for user: ${user.email}`);
            } catch (err) {
                console.error('Offer letter regeneration error:', err.message);
                results.offerLetterError = err.message;
            }
        }

        // Regenerate certificate if course is completed
        if (user.courseCompleted) {
            try {
                const { generateCertificate } = require('../services/documentService');
                const certificatePath = await generateCertificate(user, project);
                user.certificateUrl = certificatePath;
                results.certificate = certificatePath;
                console.log(`✅ Regenerated certificate for user: ${user.email}`);
            } catch (err) {
                console.error('Certificate regeneration error:', err.message);
                results.certificateError = err.message;
            }
        }

        await user.save();

        res.json({
            success: true,
            message: 'Documents regenerated successfully',
            results
        });
    } catch (err) {
        console.error('Document regeneration error:', err.message);
        res.status(500).json({ error: 'Failed to regenerate documents' });
    }
});

// POST /regenerate-all-documents — Admin endpoint to regenerate all missing documents
router.post('/regenerate-all-documents', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        console.log('🔄 Admin triggered: Regenerating all missing documents...');
        
        const usersWithProjects = await User.find({
            selectedProject: { $ne: null },
            paymentStatus: 'paid'
        }).populate('selectedProject');
        
        const results = {
            processed: 0,
            offerLettersGenerated: 0,
            certificatesGenerated: 0,
            errors: []
        };
        
        for (const user of usersWithProjects) {
            const project = user.selectedProject;
            let updated = false;
            results.processed++;
            
            try {
                // Generate offer letter if user has selected project
                if (user.selectedProject) {
                    const offerLetterPath = await generateOfferLetter(user, project);
                    user.offerLetterUrl = offerLetterPath;
                    results.offerLettersGenerated++;
                    updated = true;
                }
                
                // Generate certificate if course is completed
                if (user.courseCompleted) {
                    const { generateCertificate } = require('../services/documentService');
                    const certificatePath = await generateCertificate(user, project);
                    user.certificateUrl = certificatePath;
                    results.certificatesGenerated++;
                    updated = true;
                }
                
                if (updated) {
                    await user.save();
                }
                
            } catch (userError) {
                results.errors.push(`${user.email}: ${userError.message}`);
            }
        }
        
        console.log(`✅ Regeneration complete: ${results.offerLettersGenerated} offer letters, ${results.certificatesGenerated} certificates`);
        
        res.json({
            success: true,
            message: 'Document regeneration completed',
            results
        });
        
    } catch (err) {
        console.error('Document regeneration error:', err.message);
        res.status(500).json({ error: 'Failed to regenerate documents' });
    }
});

module.exports = router;
