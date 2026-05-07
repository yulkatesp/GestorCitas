/**
 * Script para crear un usuario doctor y vincularlo a un médico
 * Uso: node crearDoctor.js
 * 
 * Primero crea el médico en el panel admin, luego ejecuta este script
 * con el _id del médico que aparece en la base de datos.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db     = require('./database');

// ── CONFIGURA ESTOS DATOS ──
const DOCTOR_NOMBRE     = 'Dr. Carlos Gomez';
const DOCTOR_EMAIL      = 'doctor@clinica.com';
const DOCTOR_PASSWORD   = 'doctor123';
const MEDICO_NOMBRE     = 'Dr. Carlos Gomez'; // Nombre exacto del médico en la BD
// ───────────────────────────

setTimeout(async () => {
  // Buscar el médico por nombre
  db.medicos.findOne({ nombre: MEDICO_NOMBRE }, (err, medico) => {
    if (!medico) {
      console.error('❌ Médico no encontrado con ese nombre. Verifica que exista en la base de datos.');
      process.exit(1);
    }

    // Verificar si el usuario doctor ya existe
    db.usuarios.findOne({ email: DOCTOR_EMAIL }, (err, existe) => {
      if (existe) {
        console.log('⚠️  El doctor ya existe:', DOCTOR_EMAIL);
        // Actualizar la vinculación del médico de todas formas
        db.medicos.update({ _id: medico._id }, { $set: { usuario_id: existe._id } }, {}, () => {
          console.log('✅ Médico vinculado al usuario doctor');
          process.exit(0);
        });
        return;
      }

      const hash = bcrypt.hashSync(DOCTOR_PASSWORD, 10);
      db.usuarios.insert(
        { nombre: DOCTOR_NOMBRE, email: DOCTOR_EMAIL, password: hash, rol: 'doctor', creado_en: new Date() },
        (err, doc) => {
          if (err) { console.error('❌ Error:', err); process.exit(1); }

          // Vincular el médico con el usuario doctor
          db.medicos.update({ _id: medico._id }, { $set: { usuario_id: doc._id } }, {}, () => {
            console.log('✅ Doctor creado y vinculado exitosamente');
            console.log('   Email:    ', DOCTOR_EMAIL);
            console.log('   Password: ', DOCTOR_PASSWORD);
            console.log('   Médico:   ', MEDICO_NOMBRE);
            process.exit(0);
          });
        }
      );
    });
  });
}, 500);