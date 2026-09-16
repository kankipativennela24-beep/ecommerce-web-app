const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    items: [
        {
            productName: {
                type: String,
                required: true
            },

            price: {
                type: Number,
                required: true
            },

            quantity: {
                type: Number,
                required: true
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    orderDate: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        default: "Placed"
    }
});

module.exports = mongoose.model("Order", orderSchema);