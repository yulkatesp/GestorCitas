const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_dev';

// POST /api/users/register
function register(req, res) {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Email inválido' });

  const emailLower = email.toLowerCase();
  const hash = bcrypt.hashSync(password, 10);
  const nuevoUsuario = { nombre, email: emailLower, password: hash, rol: 'paciente', creado_en: new Date() };

  db.usuarios.insert(nuevoUsuario, (err, doc) => {
    if (err) return res.status(409).json({ error: 'El email ya está registrado' });

    const token = jwt.sign(
      { id: doc._id, nombre: doc.nombre, email: doc.email, rol: doc.rol },
      JWT_SECRET, { expiresIn: '24h' }
    );
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: { id: doc._id, nombre: doc.nombre, email: doc.email, rol: doc.rol }
    });
  });
}

// POST /api/users/login
function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

  db.usuarios.findOne({ email: email.toLowerCase() }, (err, usuario) => {
    if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' });
    if (!bcrypt.compareSync(password, usuario.password))
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      JWT_SECRET, { expiresIn: '24h' }
    );
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  });
}

// GET /api/users/perfil
function perfil(req, res) {
  db.usuarios.findOne({ _id: req.usuario.id }, (err, usuario) => {
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { password, ...datos } = usuario;
    res.json(datos);
  });
}

module.exports = { register, login, perfil };
