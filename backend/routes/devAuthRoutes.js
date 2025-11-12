const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Stockage temporaire
const users = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@test.com',
    password: '$2a$10$YjZmswZlAcKqWyzRWGyxgeqQZkvlAGPfwSTN7cSTUkmwLwPrzokSu',
    role: 'admin'
  }
];

// Inscription développeur
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Tous les champs sont requis' });

  const existingUser = users.find(u => u.email === email);
  if (existingUser)
    return res.status(400).json({ message: 'Email déjà utilisé' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newDev = {
    id: users.length + 1,
    name,
    email,
    password: hashedPassword,
    role: 'developer'
  };

  users.push(newDev);

  const token = jwt.sign(
    { id: newDev.id, email: newDev.email, role: newDev.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(201).json({ token, role: newDev.role });
});

module.exports = router;


