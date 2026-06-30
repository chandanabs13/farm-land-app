import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { readOrders, insertOrder, updateOrderStatus, deleteOrder } from "./db.js";
import { createToken, verifyToken, verifyPassword } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!verifyToken(token)) {
    return res.status(401).json({ error: "Admin access required" });
  }
  next();
}

// ─── Public: place order (customers) ─────────────────────────────────────────
app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, subtotal, shipping, total } = req.body;
    if (!customer?.email || !items?.length || total == null) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const order = await insertOrder({
      id: `ORD-${Date.now()}`,
      customer,
      items,
      subtotal,
      shipping,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("POST /api/orders:", err.message, err.details || "");
    res.status(500).json({ error: "Failed to save order" });
  }
});

// ─── Admin: login ─────────────────────────────────────────────────────────────
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (!verifyPassword(password)) {
    return res.status(401).json({ error: "Incorrect password" });
  }
  res.json({ token: createToken() });
});

// ─── Admin: list orders ──────────────────────────────────────────────────────
app.get("/api/orders", requireAdmin, async (_req, res) => {
  try {
    const orders = await readOrders();
    res.json(orders);
  } catch (err) {
    console.error("GET /api/orders:", err.message);
    res.status(500).json({ error: "Failed to load orders" });
  }
});

// ─── Admin: update status ────────────────────────────────────────────────────
app.patch("/api/orders/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await updateOrderStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json(updated);
  } catch (err) {
    console.error("PATCH /api/orders:", err.message);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// ─── Admin: delete order ─────────────────────────────────────────────────────
app.delete("/api/orders/:id", requireAdmin, async (req, res) => {
  try {
    const removed = await deleteOrder(req.params.id);
    if (!removed) return res.status(404).json({ error: "Order not found" });

    res.json(removed);
  } catch (err) {
    console.error("DELETE /api/orders:", err.message);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// ─── Production: serve built frontend ────────────────────────────────────────
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next();
  });
});

const server = app.listen(PORT, () => {
  console.log(`Coorg Farm API running on http://localhost:${PORT}`);
  console.log("Orders stored in Supabase");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error(`Stop the other process:  lsof -ti :${PORT} | xargs kill`);
    console.error(`Or use a different port:  PORT=3002 npm start\n`);
    process.exit(1);
  }
  throw err;
});
