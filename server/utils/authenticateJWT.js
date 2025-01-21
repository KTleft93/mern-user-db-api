const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

exports.generateJWT = (userId) => {

    return jwt.sign({ id: userId._id }, secret, { expiresIn: '1h' }); // Token expires in 1 hour
};
