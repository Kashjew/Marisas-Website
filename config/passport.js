const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Local Strategy for login
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        console.log("Login attempt with email:", email.trim());
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            console.log("User not found");
            return done(null, false, { message: 'Incorrect email or password.' });
        }

        console.log("User found:", user);
        // Compare entered password with hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        
        console.log("Entered password:", password);
        console.log("Hashed password from DB:", user.password);
        console.log("Password comparison result:", isMatch);

        if (!isMatch) {
            console.log("Password does not match");
            return done(null, false, { message: 'Incorrect email or password.' });
        }

        console.log("Login successful");
        return done(null, user);
    } catch (error) {
        console.error("Error in LocalStrategy:", error);
        return done(error);
    }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                googleId: profile.id,
                email: profile.emails[0].value.toLowerCase(),
                name: profile.displayName
            });
            await user.save();
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ facebookId: profile.id });
        if (!user) {
            user = new User({
                facebookId: profile.id,
                email: profile.emails ? profile.emails[0].value.toLowerCase() : null,
                name: `${profile.name.givenName} ${profile.name.familyName}`
            });
            await user.save();
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Serialize user instance to store in the session
passport.serializeUser((user, done) => {
    console.log("Serializing user:", user);
    done(null, user._id.toString()); // Use MongoDB ObjectId for serialization, converted to string
});

// Deserialize user instance from the session
passport.deserializeUser(async (id, done) => {
    try {
        console.log("Attempting to deserialize user with ID:", id);

        const user = await User.findById(id);  // Use the MongoDB ObjectId to find the user
        if (!user) {
            console.error("User not found during deserialization");
            return done(new Error('User not found'));
        }

        console.log("Deserializing user:", user);
        done(null, user);
    } catch (error) {
        console.error("Error in deserializing user:", error);
        done(error);
    }
});

module.exports = passport;
