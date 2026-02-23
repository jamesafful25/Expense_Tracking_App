const userService = require('../services/userService');

const getProfile = async(req, res) => {
    try {
        const user = await userService.getProfile(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const updateProfile = async(req, res) => {
    try {
        const file = req.files && req.files.avatar ? req.files.avatar : null;
        const user = await userService.updateProfile(req.user.id, req.body, file);
        res.json({ message: 'Profile updated', user });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const changePassword = async(req, res) => {
    try {
        await userService.changePassword(req.user.id, req.body);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

module.exports = { getProfile, updateProfile, changePassword };