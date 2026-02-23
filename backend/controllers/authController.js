const passport = require('passport');
const authService = require('../services/authService');
require('dotenv').config();

const register = async(req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({ message: 'Registration successful', ...result });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const login = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return res.status(500).json({ message: 'Authentication error' });
        if (!user) {
            const message = info && info.message ? info.message : 'Invalid credentials';
            return res.status(401).json({ message });
        }
        try {
            const result = authService.loginWithLocal(user);
            res.json({ message: 'Login successful', ...result });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })(req, res, next);
};

const googleCallback = (req, res) => {
    try {
        const result = authService.loginWithGoogle(req.user);
        res.redirect(
            `${process.env.FRONTEND_URL}/auth/callback?token=${result.token}`
        );
    } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
    }
};

const me = (req, res) => {
    const user = req.user;
    res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            currency: user.currency,
        },
    });
};

module.exports = { register, login, googleCallback, me };