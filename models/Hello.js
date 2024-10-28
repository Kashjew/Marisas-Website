const mongoose = require('mongoose');

const HelloSectionSchema = new mongoose.Schema({
    helloContent: { type: String, default: 'Welcome to Marisa’s recipes!' }
});

// Check if the model already exists, and use it if it does; otherwise, define it
module.exports = mongoose.models.HelloSection || mongoose.model('HelloSection', HelloSectionSchema);
