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

module.exports = router;
