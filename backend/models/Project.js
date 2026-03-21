const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    techStack: [{ type: String }],
    difficulty: {
        type: String,
        enum: ['Intermediate', 'Advanced', 'Expert'],
        required: true
    },
    category: {
        type: String,
        enum: ['Web Development', 'Mobile Development', 'AI/ML', 'Cybersecurity', 'Data Engineering', 'DevOps'],
        required: true
    },
    estimatedWeeks: { type: Number, required: true },
    learningOutcomes: [{ type: String }],
    planRequired: {
        type: String,
        enum: ['Foundation', 'Advanced'],
        default: 'Foundation'
    },
    roadmap: [{
        step: { type: String, required: true },
        description: { type: String, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
