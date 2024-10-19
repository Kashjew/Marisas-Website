const mongoose = require('mongoose');

// Define the Order Schema
const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true, // User is required for every order
    },
    items: [
        {
            post: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Post', // Reference to the Post model
                required: true, // Post is required for each item
            },
            quantity: {
                type: Number,
                required: true,
                default: 1, // Default quantity is 1
            },
            price: {
                type: Number,
                required: true, // Price is required for each item
            },
        }
    ],
    totalAmount: {
        type: Number,
        required: true, // Total amount is required for every order
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'], // Payment status options
        default: 'Pending', // Default is Pending
    },
    paymentIntentId: {
        type: String, // Optional: to store the payment intent ID from the payment processor
    },
    paymentProvider: {
        type: String, // Optional: to store the payment provider name (e.g., Stripe, PayPal)
        required: false,
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled', 'Shipped'], // Order status options
        default: 'Pending', // Default is Pending
    },
}, {
    timestamps: true, // Automatically create 'createdAt' and 'updatedAt' fields
});

// Export the Order model
module.exports = mongoose.model('Order', OrderSchema);
