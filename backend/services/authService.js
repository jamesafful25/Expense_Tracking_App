const { User } = require('../models');
const { hashPassword } = require('../utils/hashing');
const { generateToken } = require('../utils/jwt');

const register = async({ name, email, password }) => {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
        const error = new Error('Email already registered');
        error.statusCode = 409;
        throw error;
    }

    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, password: hashed });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return { user: sanitizeUser(user), token };
};

const loginWithLocal = (user) => {
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { user: sanitizeUser(user), token };
};

const loginWithGoogle = (user) => {
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { user: sanitizeUser(user), token };
};

const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    currency: user.currency,
});

module.exports = { register, loginWithLocal, loginWithGoogle };