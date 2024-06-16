// otpModel.js

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // OTP expires in 10 minutes (600 seconds)
    },
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
