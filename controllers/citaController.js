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
    let pendientes = citas.length;
    const resultado = [];
    citas.forEach(cita => {
      db.medicos.findOne({ _id: cita.medico_id }, (err, medico) => {
        resultado.push({
          id: cita._id,
          fecha: cita.fecha,
          hora: cita.hora,
          motivo: cita.motivo,
          estado: cita.estado,
          asistencia: cita.asistencia || null,
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

  // Verificar si el paciente tiene multa
  db.usuarios.findOne({ _id: req.usuario.id }, (err, usuario) => {
    if (usuario && usuario.multado) {
      return res.status(403).json({
        error: 'Tienes una multa activa por inasistencia. No puedes agendar citas hasta que un administrador la levante.',
        multado: true
      });
    }

    // Verificar que el paciente no tenga ya una cita esa misma fecha y hora
    db.citas.findOne({
      paciente_id: req.usuario.id,
      fecha,
      hora,
      estado: { $ne: 'cancelada' }
    }, (err, citaDuplicada) => {
      if (citaDuplicada)
        return res.status(409).json({ error: 'Ya tienes una cita agendada a esa misma hora ese día' });

      // Verificar que el horario esté disponible con ese médico
      db.citas.findOne({ medico_id, fecha, hora, estado: { $ne: 'cancelada' } }, (err, existe) => {
        if (existe) return res.status(409).json({ error: 'Ese horario ya está ocupado con ese médico' });

        db.medicos.findOne({ _id: medico_id, activo: true }, (err, medico) => {
          if (!medico) return res.status(404).json({ error: 'Médico no encontrado' });

          const nuevaCita = {
            paciente_id: req.usuario.id,
            medico_id, fecha, hora,
            motivo: motivo || '',
            estado: 'pendiente',
            asistencia: null,
            creado_en: new Date()
          };
          db.citas.insert(nuevaCita, (err, doc) => {
            res.status(201).json({ mensaje: 'Cita agendada exitosamente', cita_id: doc._id });
          });
        });
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

    // Verificar restricción de 1 hora (solo para pacientes, admin puede cancelar siempre)
    if (req.usuario.rol !== 'admin') {
      const ahora = new Date();
      const [anio, mes, dia] = cita.fecha.split('-').map(Number);
      const [horaC, minC] = cita.hora.split(':').map(Number);
      const fechaCita = new Date(anio, mes - 1, dia, horaC, minC);
      const diffMs = fechaCita - ahora;
      const diffMinutos = diffMs / 1000 / 60;

      if (diffMinutos < 60) {
        return res.status(400).json({
          error: 'No puedes cancelar una cita con menos de 1 hora de anticipación',
          bloqueado: true
        });
      }
    }

    db.citas.update({ _id: req.params.id }, { $set: { estado: 'cancelada' } }, {}, () => {
      res.json({ mensaje: 'Cita cancelada exitosamente' });
    });
  });
}

module.exports = { disponibilidad, misCitas, crearCita, cancelarCita };