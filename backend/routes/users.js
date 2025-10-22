const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // GET - ดึงข้อมูลผู้ใช้ทั้งหมด
  router.get("/", (req, res) => {
    const sql = "SELECT * FROM users ORDER BY created_at DESC";

    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  // GET - ดึงข้อมูลผู้ใช้ตาม ID
  router.get("/:id", (req, res) => {
    const sql = "SELECT * FROM users WHERE id = ?";

    db.get(sql, [req.params.id], (err, row) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(row);
    });
  });

  // POST - เพิ่มผู้ใช้ใหม่
  router.post("/", (req, res) => {
    const { name, email } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required",
      });
    }

    const sql = "INSERT INTO users (name, email) VALUES (?, ?)";

    db.run(sql, [name, email], function (err) {
      if (err) {
        console.error("Error adding user:", err);
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({
            error: "Email already exists",
          });
        }
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        email,
        message: "User created successfully",
      });
    });
  });

  // PUT - แก้ไขข้อมูลผู้ใช้
  router.put("/:id", (req, res) => {
    const { name, email } = req.body;
    const { id } = req.params;

    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required",
      });
    }

    const sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";

    db.run(sql, [name, email, id], function (err) {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: parseInt(id),
        name,
        email,
        message: "User updated successfully",
      });
    });
  });

  // DELETE - ลบผู้ใช้
  router.delete("/:id", (req, res) => {
    const sql = "DELETE FROM users WHERE id = ?";

    db.run(sql, [req.params.id], function (err) {
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "User deleted successfully",
        id: parseInt(req.params.id),
      });
    });
  });

  return router;
};
