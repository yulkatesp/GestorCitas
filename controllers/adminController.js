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
            asistencia: cita.asistencia || null,
            paciente: paciente ? paciente.nombre : 'Desconocido',
            paciente_email: paciente ? paciente.email : '',
            paciente_id: cita.paciente_id,
            multado: paciente ? !!paciente.multado : false,
            medico: medico ? medico.nombre : 'Desconocido',
            medico_id: cita.medico_id,
            especialidad: medico ? medico.especialidad : ''
          });
          if (--pendientes === 0) res.json(resultado);
        });
      });
    });
  });
}

// GET /api/admin/citas/doctor — citas del doctor autenticado
function citasDelDoctor(req, res) {
  // Buscar el médico asociado al usuario doctor
  db.medicos.findOne({ usuario_id: req.usuario.id }, (err, medico) => {
    if (!medico) return res.status(404).json({ error: 'No tienes un perfil médico asignado' });

    db.citas.find({ medico_id: medico._id, estado: { $ne: 'cancelada' } })
      .sort({ fecha: 1, hora: 1 }).exec((err, citas) => {
        if (!citas.length) return res.json({ medico, citas: [] });
        let pendientes = citas.length;
        const resultado = [];
        citas.forEach(cita => {
          db.usuarios.findOne({ _id: cita.paciente_id }, (err, paciente) => {
            resultado.push({
              id: cita._id, fecha: cita.fecha, hora: cita.hora,
              motivo: cita.motivo, estado: cita.estado,
              asistencia: cita.asistencia,
              paciente: paciente ? paciente.nombre : 'Desconocido',
              paciente_email: paciente ? paciente.email : '',
              paciente_id: cita.paciente_id,
            });
            if (--pendientes === 0) res.json({ medico, citas: resultado });
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
          db.usuarios.count({ multado: true }, (err, totalMultados) => {
            res.json({ totalCitas, citasPendientes, totalUsuarios, totalMedicos, totalMultados: totalMultados || 0 });
          });
        });
      });
    });
  });
}

// PATCH /api/admin/citas/:id/asistencia — admin O doctor pueden usar esto
function registrarAsistencia(req, res) {
  const { asistencia } = req.body;
  if (asistencia === undefined)
    return res.status(400).json({ error: 'Campo asistencia requerido (true/false)' });

  db.citas.findOne({ _id: req.params.id }, (err, cita) => {
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

    // Si es doctor, verificar que la cita sea suya
    if (req.usuario.rol === 'doctor') {
      db.medicos.findOne({ usuario_id: req.usuario.id }, (err, medico) => {
        if (!medico || medico._id !== cita.medico_id)
          return res.status(403).json({ error: 'No puedes modificar citas de otro médico' });
        aplicarAsistencia(cita, asistencia, res);
      });
    } else {
      aplicarAsistencia(cita, asistencia, res);
    }
  });
}

function aplicarAsistencia(cita, asistencia, res) {
  const nuevoEstado = asistencia ? 'completada' : 'no_asistio';
  db.citas.update({ _id: cita._id }, { $set: { asistencia, estado: nuevoEstado } }, {}, () => {
    if (!asistencia) {
      db.usuarios.update({ _id: cita.paciente_id }, { $set: { multado: true } }, {}, () =>
        res.json({ mensaje: 'Inasistencia registrada y multa aplicada al paciente' })
      );
    } else {
      res.json({ mensaje: 'Asistencia registrada correctamente' });
    }
  });
}

function perdonarMulta(req, res) {
  db.usuarios.findOne({ _id: req.params.id }, (err, usuario) => {
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    db.usuarios.update({ _id: req.params.id }, { $set: { multado: false } }, {}, () =>
      res.json({ mensaje: `Multa perdonada para ${usuario.nombre}` })
    );
  });
}

function pacientesMultados(req, res) {
  db.usuarios.find({ multado: true, rol: 'paciente' }, (err, usuarios) => {
    res.json(usuarios.map(u => ({ id: u._id, nombre: u.nombre, email: u.email, multado: true })));
  });
}

module.exports = {
  todasLasCitas, citasDelDoctor, listarMedicos, crearMedico, estadisticas,
  registrarAsistencia, perdonarMulta, pacientesMultados
};