const jwt = require('jsonwebtoken');
const verifyToken = async (req, res, next) => {
    let token = req.headers.authorization;
    token = token.split(" ")[1]
    if (!token) {
        const error = new Error('Unauthorized');
        error.status = 401;
        return next(error);
    }
    try {
        const user = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            const unauthorizedError = new Error('Invalid token');
            unauthorizedError.status = 401;
            next(unauthorizedError);
        } else if (error.name === 'TokenExpiredError') {
            const unauthorizedError = new Error('Permission denied');
            unauthorizedError.status = 401;
            next(unauthorizedError);
        } else {
            next(error)
        }
    }
};

module.exports = verifyToken;