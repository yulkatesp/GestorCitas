const db = require('../database');

const HORARIOS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00'
];

// GET /api/citas/disponibilidad?medico_id=xxx&fecha=2025-05-10
function disponibilidad(req, res) {
  const { medico_id, fecha } = req.query;
  if (!medico_id || !fecha)
    return res.status(400).json({ error: 'medico_id y fecha son requeridos' });

  db.citas.find({ medico_id, fecha, estado: { $ne: 'cancelada' } }, (err, citas) => {
    const ocupados = citas.map(c => c.hora);
    const disponibles = HORARIOS.filter(h => !ocupados.includes(h));
    res.json({ fecha, medico_id, disponibles });
  });
}

// GET /api/citas
function misCitas(req, res) {
  db.citas.find({ paciente_id: req.usuario.id }).sort({ fecha: -1 }).exec((err, citas) => {
    if (!citas.length) return res.json([]);
    // Enriquecer con nombre del médico
    let pendientes = citas.length;
    const resultado = [];
    citas.forEach(cita => {
      db.medicos.findOne({ _id: cita.medico_id }, (err, medico) => {
        resultado.push({
          id: cita._id, fecha: cita.fecha, hora: cita.hora,
          motivo: cita.motivo, estado: cita.estado,
          medico: medico ? medico.nombre : 'Desconocido',
          especialidad: medico ? medico.especialidad : ''
        });
        if (--pendientes === 0) res.json(resultado);
      });
    });
  });
}

// POST /api/citas
function crearCita(req, res) {
  const { medico_id, fecha, hora, motivo } = req.body;
  if (!medico_id || !fecha || !hora)
    return res.status(400).json({ error: 'medico_id, fecha y hora son obligatorios' });

  db.citas.findOne({ medico_id, fecha, hora, estado: { $ne: 'cancelada' } }, (err, existe) => {
    if (existe) return res.status(409).json({ error: 'Ese horario ya está ocupado' });

    db.medicos.findOne({ _id: medico_id, activo: true }, (err, medico) => {
      if (!medico) return res.status(404).json({ error: 'Médico no encontrado' });

      const nuevaCita = {
        paciente_id: req.usuario.id,
        medico_id, fecha, hora,
        motivo: motivo || '',
        estado: 'pendiente',
        creado_en: new Date()
      };
      db.citas.insert(nuevaCita, (err, doc) => {
        res.status(201).json({ mensaje: 'Cita agendada exitosamente', cita_id: doc._id });
      });
    });
  });
}

// DELETE /api/citas/:id
function cancelarCita(req, res) {
  db.citas.findOne({ _id: req.params.id }, (err, cita) => {
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    if (cita.paciente_id !== req.usuario.id && req.usuario.rol !== 'admin')
      return res.status(403).json({ error: 'No tienes permiso para cancelar esta cita' });

    db.citas.update({ _id: req.params.id }, { $set: { estado: 'cancelada' } }, {}, () => {
      res.json({ mensaje: 'Cita cancelada exitosamente' });
    });
  });
}

module.exports = { disponibilidad, misCitas, crearCita, cancelarCita };
