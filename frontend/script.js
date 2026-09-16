// Product prices
const productPrices = {
    "Stylish T-Shirt": 499,
    "Running Shoes": 1299,
    "Wireless Headphones": 999
};

// Shop Now button
function showMessage() {
    alert("Welcome to Vennela Store! 🛍️");
}

// Add product to cart
async function addToCart(productName) {
    try {
        const response = await fetch("http://localhost:5000/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ productName })
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ " + productName + " added to cart!");
            await loadCart();
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("❌ Backend connection failed");
    }
}

// Load cart products
async function loadCart() {
    const cartItemsDiv = document.getElementById("cart-items");

    if (!cartItemsDiv) return;

    cartItemsDiv.innerHTML = "<p>Loading cart...</p>";

    try {
        const response = await fetch("http://localhost:5000/api/cart");
        const cartItems = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load cart");
        }

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            cartItemsDiv.innerHTML = "<p>Your cart is empty 🛒</p>";
            return;
        }

        let totalAmount = 0;

        const productsHTML = cartItems.map(item => {
            const price = item.price || productPrices[item.productName] || 0;
            const quantity = item.quantity || 1;
            const subtotal = price * quantity;

            totalAmount += subtotal;

            return `
                <div class="product">
                    <div class="emoji">🛍️</div>

                    <h3>${item.productName}</h3>
                    <p>Price: ₹${price.toLocaleString("en-IN")}</p>

                    <div class="quantity-controls">
                        <button
                            onclick="changeQuantity('${item._id}', ${quantity - 1})"
                            ${quantity <= 1 ? "disabled" : ""}
                        >−</button>

                        <span>Quantity: ${quantity}</span>

                        <button
                            onclick="changeQuantity('${item._id}', ${quantity + 1})"
                        >+</button>
                    </div>

                    <p>Subtotal: ₹${subtotal.toLocaleString("en-IN")}</p>

                    <button onclick="removeFromCart('${item._id}')">
                        Remove 🗑️
                    </button>
                </div>
            `;
        }).join("");

        cartItemsDiv.innerHTML = `
            <div class="product-container">
                ${productsHTML}
            </div>

            <h2 style="margin-top: 25px;">
                Total Amount: ₹${totalAmount.toLocaleString("en-IN")}
            </h2>
        `;
    } catch (error) {
        console.error(error);
        cartItemsDiv.innerHTML =
            "<p>Unable to load cart. Please check the backend.</p>";
    }
}

// Increase or decrease quantity
async function changeQuantity(id, quantity) {
    if (quantity < 1) return;

    try {
        const response = await fetch(
            `http://localhost:5000/api/cart/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ quantity })
            }
        );

        const data = await response.json();

        if (response.ok) {
            await loadCart();
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("❌ Could not update quantity");
    }
}

// Remove product from cart
async function removeFromCart(id) {
    if (!confirm("Remove this product from your cart?")) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/cart/${id}`,
            { method: "DELETE" }
        );

        const data = await response.json();

        if (response.ok) {
            alert("✅ Product removed!");
            await loadCart();
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("❌ Could not remove product");
    }
}
const checkoutForm = document.getElementById("checkout-form");

if (checkoutForm) {
    checkoutForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const customerName = document.getElementById("customerName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();

        const messageDiv = document.getElementById("order-message");

        if (!customerName || !phone || !address) {
            messageDiv.textContent = "Please fill all details.";
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customerName,
                    phone,
                    address
                })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent =
                    "✅ Order placed successfully! Order ID: " + data.order._id;

                checkoutForm.reset();

                // Refresh cart after successful order
                if (typeof loadCart === "function") {
                    await loadCart();
                }
            } else {
                messageDiv.textContent =
                    "❌ " + (data.message || "Order failed");
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            messageDiv.textContent =
                "❌ Could not connect to backend. Check if server is running.";
        }
    });
}
async function loadOrders() {
    const ordersList = document.getElementById("orders-list");

    ordersList.innerHTML = "Loading orders...";

    try {
        const response = await fetch("http://localhost:5000/api/orders");
        const orders = await response.json();

        if (!response.ok) {
            ordersList.innerHTML = "Could not load orders.";
            return;
        }

        if (orders.length === 0) {
            ordersList.innerHTML = "<p>No orders found.</p>";
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <h3>Order ID: ${order._id}</h3>
                <p><strong>Name:</strong> ${order.customerName}</p>
                <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Total:</strong> ₹${order.totalAmount}</p>

                <h4>Products:</h4>
                <ul>
                    ${order.items.map(item => `
                        <li>
                            ${item.productName} —
                            Qty: ${item.quantity} —
                            ₹${item.price * item.quantity}
                        </li>
                    `).join("")}
                </ul>
            </div>
        `).join("");

    } catch (error) {
        console.error("Orders Error:", error);
        ordersList.innerHTML =
            "<p>Backend connection failed. Check if server is running.</p>";
    }
}