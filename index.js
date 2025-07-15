const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

const users = []; // In-memory user store

// Register user
app.post('/users/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try{
    const user = await prisma.user.create({data: {username, password}});
    res.send(`User ${user.username} registered.`);
  }catch (e){
    return res.status(400).send('Username already taken');
  }

  users.push({ username, password }); // Note: Passwords should be hashed in production!
  res.send('User registered successfully');
});

// Get all users
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
