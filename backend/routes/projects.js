const express = require('express');
const router = express.Router();
const ProjectSubmission = require('../models/ProjectSubmission');
const { analyzeReport } = require('../services/analysisService');

// POST /submit-project — Submit a project for plagiarism analysis
// Integration point: This hooks into the existing analysisService plagiarism detector
router.post('/submit-project', async (req, res) => {
    const { email, githubLink, codeContent } = req.body;

    // Validate input
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (!githubLink && !codeContent) {
        return res.status(400).json({ error: 'Either githubLink or codeContent is required' });
    }

    try {
        // Use the existing plagiarism detector to calculate a score
        // For now, we use the text-based analysis on codeContent
        const textToAnalyze = codeContent || githubLink;

        // Get previous submissions for comparison
        const previousSubmissions = await ProjectSubmission.find({}).select('codeContent githubLink email');
        const allReports = previousSubmissions.map(s => ({
            textContent: s.codeContent || s.githubLink || '',
            user: s.email // Use email as a pseudo-user ID for anonymous checks
        }));

        const analysis = analyzeReport(textToAnalyze, allReports, [], 'current-check');

        const submission = new ProjectSubmission({
            email,
            githubLink: githubLink || '',
            codeContent: codeContent || '',
            plagiarismScore: analysis.similarityScore,
            performanceScore: analysis.performanceScore,
            strengths: analysis.strengths,
            improvements: analysis.improvements,
            status: 'analyzed'
        });

        await submission.save();

        res.json({
            success: true,
            message: 'Project submitted and analyzed',
            submission: {
                id: submission._id,
                plagiarismScore: analysis.similarityScore,
                performanceScore: analysis.performanceScore,
                strengths: analysis.strengths,
                improvements: analysis.improvements
            }
        });
    } catch (err) {
        console.error('Project submission error:', err.message);
        res.status(500).json({ error: 'Failed to submit project' });
    }
});

module.exports = router;
