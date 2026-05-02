require('dotenv').config();
const bcrypt = require('bcryptjs');
const db     = require('./database');

const ADMIN_EMAIL    = 'admin@clinica.com';
const ADMIN_PASSWORD = 'Rocky2603**.';
const ADMIN_NOMBRE   = 'Administrador';

setTimeout(() => {
  db.usuarios.findOne({ email: ADMIN_EMAIL }, (err, existe) => {
    if (existe) {
      console.log('El admin ya existe:', ADMIN_EMAIL);
      process.exit(0);
    }
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    db.usuarios.insert(
      { nombre: ADMIN_NOMBRE, email: ADMIN_EMAIL, password: hash, rol: 'admin', creado_en: new Date() },
      (err, doc) => {
        if (err) { console.error('Error:', err); process.exit(1); }
        console.log('Admin creado exitosamente');
        console.log('   Email:    ', ADMIN_EMAIL);
        console.log('   Password: ', ADMIN_PASSWORD);
        process.exit(0);
      }
    );
  });
}, 500);