const Datastore = require('@seald-io/nedb');
const path = require('path');

const dbPath = (name) => path.join(__dirname, 'data', `${name}.db`);

// Crear directorio data si no existe
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

const db = {
  usuarios: new Datastore({ filename: dbPath('usuarios'), autoload: true }),
  citas:    new Datastore({ filename: dbPath('citas'),    autoload: true }),
  medicos:  new Datastore({ filename: dbPath('medicos'),  autoload: true }),
};

// Crear admin automáticamente si no existe
const bcrypt = require('bcryptjs');
setTimeout(() => {
  db.usuarios.findOne({ email: 'admin@clinica.com' }, (err, existe) => {
    if (!existe) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.usuarios.insert({
        nombre: 'Administrador',
        email: 'admin@clinica.com',
        password: hash,
        rol: 'admin',
        creado_en: new Date()
      }, () => console.log('✅ Admin creado automáticamente'));
    }
  });
}, 1000);

// Índices para búsquedas rápidas
db.usuarios.ensureIndex({ fieldName: 'email', unique: true });

// Insertar médicos de ejemplo si no existen
db.medicos.count({}, (err, count) => {
  if (count === 0) {
    const medicos = [
      { nombre: 'Dr. Carlos Gomez',  especialidad: 'Medicina general', activo: true },
      { nombre: 'Dra. Ana Martinez', especialidad: 'Pediatria',        activo: true },
      { nombre: 'Dr. Luis Herrera',  especialidad: 'Cardiologia',      activo: true },
      { nombre: 'Dra. Maria Torres', especialidad: 'Dermatologia',     activo: true },
    ];
    db.medicos.insert(medicos);
  }
});

module.exports = db;
