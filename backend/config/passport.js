const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { comparePassword } = require('../utils/hashing');
const User = require('../models/User');
require('dotenv').config();

// Local Strategy
passport.use(
    'local',
    new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
        async(email, password, done) => {
            try {
                const user = await User.findOne({ where: { email } });
                if (!user) {
                    return done(null, false, { message: 'Invalid email or password' });
                }
                if (!user.password) {
                    return done(null, false, { message: 'Please login with Google' });
                }
                const isMatch = await comparePassword(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Invalid email or password' });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// JWT Strategy
passport.use(
    'jwt',
    new JwtStrategy({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || 'fallback_dev_secret_change_me',
        },
        async(payload, done) => {
            try {
                const user = await User.findByPk(payload.id);
                if (!user) return done(null, false);
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

// Google OAuth Strategy
passport.use(
    'google',
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        },
        async(accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ where: { googleId: profile.id } });
                if (!user) {
                    user = await User.findOne({ where: { email: profile.emails[0].value } });
                    if (user) {
                        user.googleId = profile.id;
                        await user.save();
                    } else {
                        const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
                        user = await User.create({
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            name: profile.displayName,
                            avatar: avatarUrl,
                        });
                    }
                }
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

module.exports = passport;