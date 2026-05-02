require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

const frontendPath = path.resolve('frontend');
app.use(express.static(frontendPath));

app.use('/api/users', require('./routes/users'));
app.use('/api/citas', require('./routes/citas'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('frontend/pages/index.html'));
});

// Redirigir rutas limpias a las páginas
app.get('/login',    (req, res) => res.sendFile(path.resolve('frontend/pages/login.html')));
app.get('/register', (req, res) => res.sendFile(path.resolve('frontend/pages/register.html')));
app.get('/citas',    (req, res) => res.sendFile(path.resolve('frontend/pages/citas.html')));
app.get('/admin',    (req, res) => res.sendFile(path.resolve('frontend/pages/admin.html')));
app.get('/',         (req, res) => res.sendFile(path.resolve('frontend/pages/index.html')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});