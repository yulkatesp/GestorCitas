const db = require('../database');

// GET /api/admin/citas
function todasLasCitas(req, res) {
  db.citas.find({}).sort({ fecha: -1 }).exec((err, citas) => {
    if (!citas.length) return res.json([]);
    let pendientes = citas.length;
    const resultado = [];
    citas.forEach(cita => {
      db.usuarios.findOne({ _id: cita.paciente_id }, (err, paciente) => {
        db.medicos.findOne({ _id: cita.medico_id }, (err, medico) => {
          resultado.push({
            id: cita._id,
            fecha: cita.fecha,
            hora: cita.hora,
            motivo: cita.motivo,
            estado: cita.estado,
            asistencia: cita.asistencia || null,
            paciente: paciente ? paciente.nombre : 'Desconocido',
            paciente_email: paciente ? paciente.email : '',
            paciente_id: cita.paciente_id,
            multado: paciente ? !!paciente.multado : false,
            medico: medico ? medico.nombre : 'Desconocido',
            especialidad: medico ? medico.especialidad : ''
          });
          if (--pendientes === 0) res.json(resultado);
        });
      });
    });
  });
}

// GET /api/admin/medicos
function listarMedicos(req, res) {
  db.medicos.find({}).sort({ nombre: 1 }).exec((err, medicos) => res.json(medicos));
}

// POST /api/admin/medicos
function crearMedico(req, res) {
  const { nombre, especialidad } = req.body;
  if (!nombre || !especialidad)
    return res.status(400).json({ error: 'nombre y especialidad son obligatorios' });
  db.medicos.insert({ nombre, especialidad, activo: true }, (err, doc) => {
    res.status(201).json({ mensaje: 'Médico creado', id: doc._id });
  });
}

// GET /api/admin/estadisticas
function estadisticas(req, res) {
  db.citas.count({}, (err, totalCitas) => {
    db.citas.count({ estado: 'pendiente' }, (err, citasPendientes) => {
      db.usuarios.count({ rol: 'paciente' }, (err, totalUsuarios) => {
        db.medicos.count({ activo: true }, (err, totalMedicos) => {
          db.usuarios.count({ multado: true }, (err, totalMultados) => {
            res.json({ totalCitas, citasPendientes, totalUsuarios, totalMedicos, totalMultados });
          });
        });
      });
    });
  });
}

// PATCH /api/admin/citas/:id/asistencia
function registrarAsistencia(req, res) {
  const { asistencia } = req.body; // true = asistió, false = no asistió
  if (asistencia === undefined)
    return res.status(400).json({ error: 'Campo asistencia requerido (true/false)' });

  db.citas.findOne({ _id: req.params.id }, (err, cita) => {
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

    const nuevoEstado = asistencia ? 'completada' : 'no_asistio';

    db.citas.update(
      { _id: req.params.id },
      { $set: { asistencia, estado: nuevoEstado } },
      {},
      (err) => {
        // Si no asistió, aplicar multa al paciente
        if (!asistencia) {
          db.usuarios.update(
            { _id: cita.paciente_id },
            { $set: { multado: true } },
            {},
            () => res.json({ mensaje: 'Inasistencia registrada y multa aplicada al paciente' })
          );
        } else {
          res.json({ mensaje: 'Asistencia registrada correctamente' });
        }
      }
    );
  });
}

// PATCH /api/admin/usuarios/:id/perdonar-multa
function perdonarMulta(req, res) {
  db.usuarios.findOne({ _id: req.params.id }, (err, usuario) => {
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    db.usuarios.update(
      { _id: req.params.id },
      { $set: { multado: false } },
      {},
      () => res.json({ mensaje: `Multa perdonada para ${usuario.nombre}` })
    );
  });
}

// GET /api/admin/pacientes-multados
function pacientesMultados(req, res) {
  db.usuarios.find({ multado: true, rol: 'paciente' }, (err, usuarios) => {
    const resultado = usuarios.map(u => ({
      id: u._id,
      nombre: u.nombre,
      email: u.email,
      multado: true
    }));
    res.json(resultado);
  });
}

module.exports = {
  todasLasCitas, listarMedicos, crearMedico, estadisticas,
  registrarAsistencia, perdonarMulta, pacientesMultados
};