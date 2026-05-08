const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_dev');
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
}

function soloDoctor(req, res, next) {
  if (req.usuario.rol !== 'doctor') {
    return res.status(403).json({ error: 'Acceso restringido a doctores' });
  }
  next();
}

function adminODoctor(req, res, next) {
  if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'doctor') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}

module.exports = {
  verificarToken,
  soloAdmin,
  soloDoctor,
  adminODoctor
};
