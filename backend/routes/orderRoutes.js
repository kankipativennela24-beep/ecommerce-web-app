const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Place order
router.post("/", async (req, res) => {
    try {
        const { customerName, phone, address } = req.body;

        // Check customer details
        if (!customerName || !phone || !address) {
            return res.status(400).json({
                message: "Please fill all customer details"
            });
        }

        // Get cart products
        const cartItems = await Cart.find();

        if (cartItems.length === 0) {
            return res.status(400).json({
                message: "Your cart is empty"
            });
        }

        // Calculate total amount
        const items = cartItems.map(item => ({
            productName: item.productName,
            price: item.price,
            quantity: item.quantity || 1
        }));

        const totalAmount = items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        // Create order
        const newOrder = new Order({
            customerName,
            phone,
            address,
            items,
            totalAmount
        });

        await newOrder.save();

        // Clear cart after order is saved
        await Cart.deleteMany({});

        res.status(201).json({
            message: "Order placed successfully!",
            order: newOrder
        });

    } catch (error) {
        console.error("Order Error:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
});

// Get all orders
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;