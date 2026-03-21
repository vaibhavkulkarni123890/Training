const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    email: { type: String, default: '' },
    paymentId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true, unique: true },
    planType: {
        type: String,
        enum: ['Foundation', 'Advanced'],
        required: true
    },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'paid'
    },
    razorpaySignature: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
