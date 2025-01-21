const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Forbidden: Invalid token' });
            }
            req.user = user; 
            next();
        });
    } else {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
}

module.exports = {verifyJWT};