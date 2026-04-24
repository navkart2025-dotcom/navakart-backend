const express = require("express");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
let cartStore = {};

// 🔐 Woo credentials
const BASE_URL = "https://navakartstore.com";
const CK = "ck_638b443f480816111e90a44e462329c44c3732b1";
const CS = "cs_a661347493ca86cc156de3a624a35b7eabb51998";

// ADD TO CART
app.post("/add-to-cart", (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!cartStore[userId]) {
    cartStore[userId] = [];
  }

  const existingItem = cartStore[userId].find(
    item => item.productId === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cartStore[userId].push({ productId, quantity });
  }

  res.json({
    message: "Item added",
    cart: cartStore[userId]
  });
});
// GET CART
app.get("/cart", async (req, res) => {
  try {
    const response = await fetch(
      `${BASE_URL}/wp-json/wc/store/v1/cart`
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PLACE ORDER
app.post("/place-order", async (req, res) => {
  try {
    const response = await fetch(
      `${BASE_URL}/wp-json/wc/v3/orders?consumer_key=${CK}&consumer_secret=${CS}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/", (req, res) => {
  res.send("Navakart Backend Running ✅");
});
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running...");
});
