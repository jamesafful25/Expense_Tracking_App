const passport = require('passport');
const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

const authenticate = async(req, res, next) => {
    // For file downloads: accept token from query param
    if (req.query.token) {
        try {
            const decoded = verifyToken(req.query.token);
            const user = await User.findByPk(decoded.id);
            if (!user) return res.status(401).json({ message: 'Unauthorized.' });
            req.user = user;
            return next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
    }

    // Standard Bearer token from Authorization header
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Authentication error', error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized. Invalid or expired token.' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

module.exports = { authenticate, requireAdmin };