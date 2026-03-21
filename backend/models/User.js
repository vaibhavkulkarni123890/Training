const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    password: { type: String, required: true },
    planType: {
        type: String,
        enum: ['Foundation', 'Advanced', 'None'],
        default: 'None'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'pending', 'paid'],
        default: 'unpaid'
    },
    upiTransactionId: { type: String, default: '' },
    paymentScreenshotUrl: { type: String, default: '' },
    requestedPlan: {
        type: String,
        enum: ['Foundation', 'Advanced', 'None'],
        default: 'None'
    },
    selectedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    projectLockedAt: { type: Date, default: null },
    courseCompleted: { type: Boolean, default: false },
    offerLetterUrl: { type: String, default: '' },
    certificateUrl: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    enrollmentDate: { type: Date, default: Date.now },
    weeklySubmissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
    
    // Referral System
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralCount: { type: Number, default: 0 },
    totalReferralEarnings: { type: Number, default: 0 }
}, { timestamps: true });

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
