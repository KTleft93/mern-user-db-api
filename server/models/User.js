const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: {
            type: String, 
            required: false,
        },
    resetTokenExpiration: {
            type: Date, 
            required: false,
        },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


const User = mongoose.model('User', UserSchema);
module.exports = { User };
