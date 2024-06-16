const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    index: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    entryPoint: {
        type: Number,
        required: true
    },
    stopLoss: {
        type: Number,
        required: true
    },
    profit1: {
        type: Number,
        required: true
    },
    profit2: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String,
        default: 'Admin'
    }
});

const Data = mongoose.model('Data', dataSchema);

module.exports = Data;
