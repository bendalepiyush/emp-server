const jwt = require('jsonwebtoken');
const jwtKey = require('../../config/jwt');

module.exports = (req, res, next) => {
    try {
        const decode = jwt.verify(req.body.token, jwtKey);
        req.supervisorData = decode;
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Authentication Failed',
            status: 401
        });
    }
}