//index.js
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const authRoutes = require("./authRoutes");
// const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
// app.use(cors());

// app.use(session({
//   secret: "newAPP",
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: false,  // true only if using HTTPS
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000
//   }
// }));

app.use(cors({
  origin: "http://localhost:5000",
  credentials: true
}));


app.use(express.json());
app.use(cookieParser());


app.use(express.static("public"));
console.log('chaliracha yeta?');
app.use("/auth", authRoutes);


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
  console.log("POST /tasks received:", req.body);
  // console.log(req.session);
  // console.log ("DEBUGGING", req.body);
  // console.log ("DEBUIGGING SESSION", req.session);
  
  const { task, user_id } = req.body;
  console.log("Task:", task, "User ID:", user_id);

  // console.log(req.session.user_id);

  // console.log("DEBUG POST /tasks", { task, user_id }); 

  if (!task) {
    return res.status(400).json({ error: "Task is required" });
  }

  if (!task) return res.status(400).json({ error: "Task is required" });
  if (!user_id) return res.status(401).json({ error: "Not logged in" });

  const sql = "INSERT INTO tasks (task, user_id) VALUES (?, ?)";
  db.query(sql, [task, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, task, user_id });
  
     // res.json("OK");
     
});
});


app.get("/auth/me", (req, res) => {
  if (req.session.user_id) {
    res.json({ loggedIn: true, user_id: req.session.user_id });
  } else {
    res.json({ loggedIn: false });
  }
});

//  Get tasks for a user
app.get("/tasks", (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(401).json({ error: "Not logged in" });

  const sql = "SELECT * FROM tasks WHERE user_id = ?";
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get single task
app.get("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM tasks WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(results[0]);
  });
});
//

// Update task
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { task, user_id } = req.body;

  if (!user_id) return res.status(401).json({ error: "Not logged in" });
  if (!task) return res.status(400).json({ error: "Task is required" });

  const sql = "UPDATE tasks SET task = ? WHERE id = ? AND user_id = ?";
  db.query(sql, [task, id, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Task not found or not yours" });
    res.json({ id, task });
  });
});

// Delete task
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) return res.status(401).json({ error: "Not logged in" });

  const sql = "DELETE FROM tasks WHERE id = ? AND user_id = ?";
  db.query(sql, [id, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Task not found or not yours" });
    res.json({ message: "Task deleted", id });
  });
});


//logout
app.post("/auth/logout", (req, res) => {
  // Clear the 'user_id' cookie
  res.clearCookie("user_id", { path: "/" });
  res.json({ message: "Logged out successfully" });
});


// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});