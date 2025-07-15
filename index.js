const express = require('express');
const app = express();

app.use(express.json());

const users = []; // In-memory user store

// Register user
app.post('/users/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  if (users.find(u => u.username === username)) {
    return res.status(400).send('Username already taken');
  }

  users.push({ username, password }); // Note: Passwords should be hashed in production!
  res.send('User registered successfully');
});

// Get all users
app.get('/users', (req, res) => {
  res.json(users);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
