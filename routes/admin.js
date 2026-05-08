const express = require('express');
const router  = express.Router();
const {
  todasLasCitas, citasDelDoctor, listarMedicos, crearMedico, estadisticas,
  registrarAsistencia, perdonarMulta, pacientesMultados
} = require('../controllers/adminController');
const { verificarToken, soloAdmin, soloDoctor } = require('../middleware/auth');

// Pública para cualquier usuario autenticado
router.get('/medicos', verificarToken, listarMedicos);

// Doctor Y admin pueden registrar asistencia y ver sus citas
router.patch(
  '/citas/:id/asistencia',
  verificarToken,
  adminODoctor,
  registrarAsistencia
);
router.get('/citas/doctor',            verificarToken, soloDoctor, citasDelDoctor);

// Solo admin
router.get('/citas',                         verificarToken, soloAdmin, todasLasCitas);
router.post('/medicos',                      verificarToken, soloAdmin, crearMedico);
router.get('/estadisticas',                  verificarToken, soloAdmin, estadisticas);
router.patch('/usuarios/:id/perdonar-multa', verificarToken, soloAdmin, perdonarMulta);
router.get('/pacientes-multados',            verificarToken, soloAdmin, pacientesMultados);

module.exports = router;