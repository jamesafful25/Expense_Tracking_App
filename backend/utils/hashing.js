const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const hashPassword = async(password) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
};

const comparePassword = async(plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = { hashPassword, comparePassword };