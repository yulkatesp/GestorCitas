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