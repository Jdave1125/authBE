// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authService = require('./authService.cjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'fred';

app.use(cors());
app.use(bodyParser.json());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.username = decoded.username;
    next();
  });
};

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Route for user registration
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await authService.register(username, password);
    res.status(201).json({ message: 'Registration successful', user });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

// Route for user login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await authService.login(username, password);
    const token = jwt.sign({ username }, SECRET_KEY);
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(401).json({ message: 'Login failed', error: error.message });
  }
});

// Protected route example
app.get('/api/user', verifyToken, (req, res) => {
  res.json({ message: 'Protected route accessed by user:', username: req.username });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
