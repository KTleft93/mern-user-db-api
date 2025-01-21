const crypto = require('crypto');

function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

function calculateResetTokenExpiration() {
    return new Date(Date.now() + 3600000); // Token expires in 1 hour
}

module.exports = { encryptMnemonic, decryptMnemonic, generateResetToken, calculateResetTokenExpiration };
