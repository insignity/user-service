const express = require('express');
const {PrismaClient} = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key'; // Use env variable in production


// Register user
app.post('/users/register', async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const user = await prisma.user.create({data: {username, password: hashedPassword}});
        res.send(`User ${user.username} registered.`);
    } catch (e) {
        res.status(400).send('Error: ' + e.message);
    }
});

app.post('/users/login', async (req, res) => {
    const {username, password} = req.body;

    const user = await prisma.user.findUnique({where: {username}});

    if (!user) {
        return res.status(401).send('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: '7d'});

    res.json({token});
})

// Get all users
app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.get('/users/me', authenticateToken, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
    });
    res.json({ id: user.id, username: user.username });
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) return res.sendStatus(401); // Not logged in

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user;
        next();
    });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);

});

