import dotenv from 'dotenv';
dotenv.config();

console.log('Environment Variables:', {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET ? '***loaded***' : 'NOT LOADED',
  PORT: process.env.PORT
});
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/user.js';
import Task from './models/Task.js';
import authMiddleware from './middleware/auth.js';
 
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname)));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

  
// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10)
    });

    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected routes


app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { tasks } = req.body;
    const userId = req.userId;

    // Save tasks
    const savedTasks = await Task.insertMany(
      tasks.map(task => ({
        ...task,
        user: userId,
        date: new Date()
      }))
    );

    res.status(201).json(savedTasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      user: userId,
      date: { $gte: today }
    }).populate('user', 'name');

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leaderboard = await Task.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { 
        _id: '$user',
        points: { $sum: '$points' },
        count: { $sum: '$count' }
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }},
      { $unwind: '$user' },
      { $project: {
        name: '$user.name',
        points: 1,
        count: 1
      }},
      { $sort: { points: -1 } }
    ]);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));