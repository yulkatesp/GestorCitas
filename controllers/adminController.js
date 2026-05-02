const db = require('../database');

function todasLasCitas(req, res) {
  db.citas.find({}).sort({ fecha: -1 }).exec((err, citas) => {
    if (!citas.length) return res.json([]);
    let pendientes = citas.length;
    const resultado = [];
    citas.forEach(cita => {
      db.usuarios.findOne({ _id: cita.paciente_id }, (err, paciente) => {
        db.medicos.findOne({ _id: cita.medico_id }, (err, medico) => {
          resultado.push({
            id: cita._id, fecha: cita.fecha, hora: cita.hora,
            motivo: cita.motivo, estado: cita.estado,
            paciente: paciente ? paciente.nombre : 'Desconocido',
            paciente_email: paciente ? paciente.email : '',
            medico: medico ? medico.nombre : 'Desconocido',
            especialidad: medico ? medico.especialidad : ''
          });
          if (--pendientes === 0) res.json(resultado);
        });
      });
    });
  });
}

function listarMedicos(req, res) {
  db.medicos.find({}).sort({ nombre: 1 }).exec((err, medicos) => res.json(medicos));
}

function crearMedico(req, res) {
  const { nombre, especialidad } = req.body;
  if (!nombre || !especialidad)
    return res.status(400).json({ error: 'nombre y especialidad son obligatorios' });
  db.medicos.insert({ nombre, especialidad, activo: true }, (err, doc) => {
    res.status(201).json({ mensaje: 'Médico creado', id: doc._id });
  });
}

function estadisticas(req, res) {
  db.citas.count({}, (err, totalCitas) => {
    db.citas.count({ estado: 'pendiente' }, (err, citasPendientes) => {
      db.usuarios.count({ rol: 'paciente' }, (err, totalUsuarios) => {
        db.medicos.count({ activo: true }, (err, totalMedicos) => {
          res.json({ totalCitas, citasPendientes, totalUsuarios, totalMedicos });
        });
      });
    });
  });
}

module.exports = { todasLasCitas, listarMedicos, crearMedico, estadisticas };
