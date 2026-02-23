const { User } = require('../models');
const { hashPassword } = require('../utils/hashing');
const { uploadFile } = require('../utils/fileUpload');

const getProfile = async(userId) => {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'googleId'] },
    });
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    return user;
};

const updateProfile = async(userId, data, file) => {
    const user = await User.findByPk(userId);
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const updates = {};
    if (data.name) updates.name = data.name;
    if (data.currency) updates.currency = data.currency;

    if (file) {
        updates.avatar = uploadFile(file, 'avatars');
    }

    await user.update(updates);
    return getProfile(userId);
};

const changePassword = async(userId, { currentPassword, newPassword }) => {
    const { comparePassword } = require('../utils/hashing');
    const user = await User.findByPk(userId);

    if (!user.password) {
        const error = new Error('Cannot change password for OAuth accounts');
        error.statusCode = 400;
        throw error;
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 400;
        throw error;
    }

    const hashed = await hashPassword(newPassword);
    await user.update({ password: hashed });
};

module.exports = { getProfile, updateProfile, changePassword };