const express = require('express');
const router  = express.Router();
const {
  todasLasCitas, listarMedicos, crearMedico, estadisticas,
  registrarAsistencia, perdonarMulta, pacientesMultados
} = require('../controllers/adminController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// Pública para usuarios autenticados
router.get('/medicos', verificarToken, listarMedicos);

// Solo admin
router.get('/citas',                          verificarToken, soloAdmin, todasLasCitas);
router.post('/medicos',                       verificarToken, soloAdmin, crearMedico);
router.get('/estadisticas',                   verificarToken, soloAdmin, estadisticas);
router.patch('/citas/:id/asistencia',         verificarToken, soloAdmin, registrarAsistencia);
router.patch('/usuarios/:id/perdonar-multa',  verificarToken, soloAdmin, perdonarMulta);
router.get('/pacientes-multados',             verificarToken, soloAdmin, pacientesMultados);

module.exports = router;