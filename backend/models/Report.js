const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekNumber: { type: Number, required: true },
    textContent: { type: String, required: true },
    fileUrl: { type: String },
    analysis: {
        similarityScore: { type: Number, default: 0 },
        performanceScore: { type: Number, default: 0 },
        feedback: [String], // New dynamic feedback array
        status: { type: String, enum: ['pending', 'analyzed'], default: 'pending' }
    },
    isEligibleForCertificate: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
