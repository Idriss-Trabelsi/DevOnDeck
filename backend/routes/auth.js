const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const admin = {
  email: 'admin@test.com',
  password: '$2a$10$YjZmswZlAcKqWyzRWGyxgeqQZkvlAGPfwSTN7cSTUkmwLwPrzokSu', // hash de "admin123"
  role: 'admin'
};

// Route de connexion admin
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email !== admin.email)
    return res.status(400).json({ message: 'Email incorrect' });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch)
    return res.status(400).json({ message: 'Mot de passe incorrect' });

  const token = jwt.sign(
    { email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token, role: admin.role });
});

module.exports = router;






