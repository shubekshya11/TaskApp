const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tasks_db"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

// Routes
// Add task
app.post("/tasks", (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: "Task is required" });
  }
  const sql = "INSERT INTO tasks (task) VALUES (?)";
  db.query(sql, [task], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result });
  });
});

// Get a single task
app.get("/tasks/:id", (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  db.query("SELECT * FROM tasks WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(results[0]);
  });
});

// Get tasks
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Update task
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { task } = req.body;
  const sql = "UPDATE tasks SET task = ? WHERE id = ?";
  db.query(sql, [task, id], (err, result) => {
    if (err) throw err;
    res.json({ id, task });
  });
});

// 4. Delete task
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM tasks WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.json({ message: "Task deleted", id });
  });
});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});

