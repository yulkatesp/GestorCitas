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
app.get('/doctor', (req, res) => res.sendFile(path.resolve('frontend/pages/doctor.html')));





app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const bcrypt = require('bcryptjs');
const db = require('./database');

setTimeout(() => {
  const doctores = [
    { nombre: 'Dr. Carlos Gomez',  email: 'carlos@clinica.com',  password: 'doctor123' },
    { nombre: 'Dra. Ana Martinez', email: 'ana@clinica.com',     password: 'doctor123' },
    { nombre: 'Dr. Luis Herrera',  email: 'luis@clinica.com',    password: 'doctor123' },
    { nombre: 'Dra. Maria Torres', email: 'maria@clinica.com',   password: 'doctor123' },
  ];

  doctores.forEach(({ nombre, email, password }) => {
    db.medicos.findOne({ nombre }, (err, medico) => {
      if (!medico) { console.log(`⚠️ Médico no encontrado: ${nombre}`); return; }

      db.usuarios.findOne({ email }, (err, existe) => {
        if (existe) {
          // Asegurar que el médico esté vinculado aunque el usuario ya exista
          db.medicos.update({ _id: medico._id }, { $set: { usuario_id: existe._id } }, {});
          return;
        }

        const hash = bcrypt.hashSync(password, 10);
        db.usuarios.insert(
          { nombre, email, password: hash, rol: 'doctor', creado_en: new Date() },
          (err, doc) => {
            if (err) { console.log(`❌ Error creando doctor ${nombre}:`, err); return; }
            db.medicos.update({ _id: medico._id }, { $set: { usuario_id: doc._id } }, {}, () => {
              console.log(`✅ Doctor creado: ${email}`);
            });
          }
        );
      });
    });
  });
}, 1500);