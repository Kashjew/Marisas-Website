const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema definition
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true, // Email is required
        unique: true,   // Email must be unique
        lowercase: true // Ensure email is stored in lowercase
    },
    password: {
        type: String, // Password is optional for social logins
        required: function() {
            // Password is required if the user doesn't have social login credentials
            return !(this.googleId || this.facebookId);
        }
    },
    googleId: {
        type: String,
        unique: true, // Google ID must be unique
        sparse: true, // Allows multiple users without a Google ID
    },
    facebookId: {
        type: String,
        unique: true, // Facebook ID must be unique
        sparse: true, // Allows multiple users without a Facebook ID
    },
    isAdmin: {
        type: Boolean,
        default: false, // Default user role is not admin
    },
    date: {
        type: Date,
        default: Date.now, // Automatically set to current date
    },
    name: {
        type: String, // Optional: to store user's name
    },
});

// Hash password before saving to the database
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next(); // Only hash if password is new or modified
    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next(); // Proceed to save the user
    } catch (error) {
        return next(error); // Handle error during hashing
    }
});

// Method to compare input password with hashed password in the database
UserSchema.methods.comparePassword = async function (inputPassword) {
    try {
        return await bcrypt.compare(inputPassword, this.password); // Return true if passwords match
    } catch (error) {
        throw new Error('Error comparing passwords'); // Handle error during comparison
    }
};

// Export the User model
module.exports = mongoose.model('User', UserSchema);
