const mongoose = require('mongoose');

const ProjectSubmissionSchema = new mongoose.Schema({
    email: { type: String, required: true },
    githubLink: { type: String, default: '' },
    codeContent: { type: String, default: '' },
    plagiarismScore: { type: Number, default: 0 },
    performanceScore: { type: Number, default: 0 },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    status: {
        type: String,
        enum: ['pending', 'analyzed'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('ProjectSubmission', ProjectSubmissionSchema);
