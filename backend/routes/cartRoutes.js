const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// Product prices
const products = {
    "Stylish T-Shirt": 499,
    "Running Shoes": 1299,
    "Wireless Headphones": 999
};

// Get all cart products
router.get("/", async (req, res) => {
    try {
        const cartItems = await Cart.find();
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add product to cart
router.post("/", async (req, res) => {
    try {
        const { productName } = req.body;
        const price = products[productName];

        if (price === undefined) {
            return res.status(400).json({
                message: "Product not found"
            });
        }

        let cartItem = await Cart.findOne({ productName });

        if (cartItem) {
            cartItem.quantity = (cartItem.quantity || 1) + 1;
            cartItem.price = price;
            await cartItem.save();
        } else {
            cartItem = new Cart({
                productName,
                price,
                quantity: 1
            });

            await cartItem.save();
        }

        res.status(201).json({
            message: "Product added successfully!",
            cartItem
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update quantity
router.patch("/:id", async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
            });
        }

        const cartItem = await Cart.findByIdAndUpdate(
            req.params.id,
            { quantity },
            { new: true, runValidators: true }
        );

        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        res.json({
            message: "Quantity updated!",
            cartItem
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove product from cart
router.delete("/:id", async (req, res) => {
    try {
        const deletedItem = await Cart.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        res.json({ message: "Product removed successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;