//authRoutes
const express = require("express");
const router = express.Router();
const db = require("./db"); 

// Register
router.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  const sql = "INSERT INTO users1 (username, password) VALUES (?, ?)";
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Username already exists" });
      }
      return res.status(500).json({ error: err.message }); 
    }
    res.json({ message: "User registered successfully" });
  });
});

// Login
router.post("/login", (req, res) => {
  console.log("Login request received:", req.body);
  const { username, password } = req.body;

  const sql = "SELECT * FROM users1 WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];

     // Store user_id in session cookie
    // req.session.user_id = user.id;

    // send back user_id instead of storing in session
    res.json({
      message: "Login successful",
      user_id: user.id
    });
    // res.json({ message: "Login successful", user_id: user.id });
  });
});


module.exports = router;    